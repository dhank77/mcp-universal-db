import { SchemaReader, type TableInfo } from './schema-reader.js';

export class PromptGenerator {
  private schemaReader: SchemaReader;

  constructor() {
    this.schemaReader = SchemaReader.getInstance();
  }

  async generateDynamicPrompts() {
    const schema = await this.schemaReader.getSchema();
    const prompts = [];

    for (const table of schema) {
      // Generate query prompt for each table
      prompts.push({
        name: `query-${table.name}`,
        title: `Query_${this.capitalize(table.name)}`,
        description: `Query ${table.name} table using natural language instructions`,
        arguments: [
          {
            name: "instructions",
            description: `Natural language query instructions for ${table.name} table (e.g., 'count records', 'show recent entries', 'filter by specific criteria')`,
            required: true
          }
        ]
      });

      // Generate insert prompt for each table
      prompts.push({
        name: `insert-${table.name}`,
        title: `Insert_${this.capitalize(table.name)}`,
        description: `Insert a new record into ${table.name} table`,
        arguments: [
          {
            name: "record_data",
            description: `Record details for ${table.name} including: ${table.columns.map(col => col.name).join(', ')}`,
            required: true
          }
        ]
      });

      // Generate update prompt for each table
      prompts.push({
        name: `update-${table.name}`,
        title: `Update_${this.capitalize(table.name)}`,
        description: `Update records in ${table.name} table`,
        arguments: [
          {
            name: "update_instructions",
            description: `Update instructions including what to update and conditions (e.g., 'set status=active where id=1')`,
            required: true
          }
        ]
      });

      // Generate delete prompt for each table
      prompts.push({
        name: `delete-${table.name}`,
        title: `Delete_${this.capitalize(table.name)}`,
        description: `Delete records from ${table.name} table`,
        arguments: [
          {
            name: "delete_criteria",
            description: `Deletion criteria (e.g., 'id=123', 'name=John Smith', 'status=inactive')`,
            required: true
          }
        ]
      });
    }

    return prompts;
  }

  async generatePromptContent(promptName: string, args: any): Promise<string> {
    const [action, tableName] = promptName.split('-', 2);
    const table = await this.schemaReader.getTableByName(tableName);
    
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }

    switch (action) {
      case 'query':
        return this.generateQueryPrompt(table, args.instructions);
      case 'insert':
        return this.generateInsertPrompt(table, args.record_data);
      case 'update':
        return this.generateUpdatePrompt(table, args.update_instructions);
      case 'delete':
        return this.generateDeletePrompt(table, args.delete_criteria);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  private generateQueryPrompt(table: TableInfo, instructions: string): string {
    return `
# Query ${table.name} Table

You are a database query assistant. Generate appropriate SQL SELECT queries for the ${table.name} table based on natural language instructions.

## Table Schema: ${table.name}
${this.generateTableSchema(table)}

## User Instructions:
${instructions}

## Task:
1. Analyze the user instructions
2. Generate appropriate SQL SELECT query
3. Use proper WHERE clauses, JOINs if needed
4. Include LIMIT if appropriate
5. Ensure query is safe and optimized

Generate the SQL query and explain your reasoning.
    `;
  }

  private generateInsertPrompt(table: TableInfo, recordData: string): string {
    return `
# Insert Record into ${table.name} Table

You are a database insert assistant. Generate appropriate SQL INSERT queries for the ${table.name} table.

## Table Schema: ${table.name}
${this.generateTableSchema(table)}

## Record Data:
${recordData}

## Task:
1. Parse the record data
2. Map to appropriate table columns
3. Generate INSERT statement
4. Handle foreign key relationships if any
5. Validate required fields

Generate the SQL INSERT query with proper data validation.
    `;
  }

  private generateUpdatePrompt(table: TableInfo, updateInstructions: string): string {
    return `
# Update Records in ${table.name} Table

You are a database update assistant. Generate appropriate SQL UPDATE queries for the ${table.name} table.

## Table Schema: ${table.name}
${this.generateTableSchema(table)}

## Update Instructions:
${updateInstructions}

## Task:
1. Parse the update instructions
2. Generate appropriate UPDATE statement
3. Include proper WHERE clause
4. Validate column names and data types
5. Ensure safe update operation

Generate the SQL UPDATE query with confirmation requirement.
    `;
  }

  private generateDeletePrompt(table: TableInfo, deleteCriteria: string): string {
    return `
# Delete Records from ${table.name} Table

You are a database delete assistant. Generate appropriate SQL DELETE queries for the ${table.name} table.

## Table Schema: ${table.name}
${this.generateTableSchema(table)}

## Delete Criteria:
${deleteCriteria}

## Task:
1. Parse the delete criteria
2. Generate appropriate DELETE statement
3. Include proper WHERE clause
4. Ensure safe deletion (avoid accidental mass deletes)
5. Require confirmation for destructive operations

Generate the SQL DELETE query with safety checks.
    `;
  }

  private generateTableSchema(table: TableInfo): string {
    let schema = `
### Columns:
`;
    for (const column of table.columns) {
      schema += `- **${column.name}** (${column.type}) - ${column.nullable ? 'Nullable' : 'Not Null'}`;
      if (column.key === 'PRI') schema += ' [PRIMARY KEY]';
      if (column.key === 'MUL') schema += ' [FOREIGN KEY]';
      if (column.default !== null) schema += ` [Default: ${column.default}]`;
      schema += '\n';
    }

    if (table.foreignKeys.length > 0) {
      schema += `\n### Foreign Keys:\n`;
      for (const fk of table.foreignKeys) {
        schema += `- ${fk.column} → ${fk.referencedTable}.${fk.referencedColumn}\n`;
      }
    }

    return schema;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}