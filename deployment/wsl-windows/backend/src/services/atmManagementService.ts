// ATM Management Database Integration Service
import { Client } from 'pg';

// Connection to ATM Management System database
const atmDbClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'atm_management_system',
  user: 'yanrypangouw',
  // password: '', // Add if needed
});

// Initialize connection
let isConnected = false;

const connectATMDatabase = async (): Promise<void> => {
  if (!isConnected) {
    try {
      await atmDbClient.connect();
      isConnected = true;
      console.log('✅ Connected to ATM Management System database');
    } catch (error) {
      console.error('❌ Failed to connect to ATM Management System database:', error);
      throw error;
    }
  }
};

export interface BranchData {
  code: string;
  name: string;
  region?: string;
  isActive: boolean;
}

export interface TerminalData {
  id: string;
  name: string;
  type: string;
  branchCode: string;
  isActive: boolean;
}

export interface BSGMasterDataFormat {
  value: string;
  label: string;
  isDefault: boolean;
}

export const atmManagementService = {
  // Get all branches/capems
  async getBranches(): Promise<BranchData[]> {
    await connectATMDatabase();
    
    try {
      const query = `
        SELECT cabang_code, cabang_name, region, is_active
        FROM master_cabang 
        WHERE is_active = true
        ORDER BY cabang_name ASC
      `;
      
      const result = await atmDbClient.query(query);
      
      return result.rows.map(row => ({
        code: row.cabang_code,
        name: row.cabang_name,
        region: row.region,
        isActive: row.is_active
      }));
    } catch (error) {
      console.error('Error fetching branches from ATM database:', error);
      throw error;
    }
  },

  // Get all ATM terminals
  async getTerminals(): Promise<TerminalData[]> {
    await connectATMDatabase();
    
    try {
      const query = `
        SELECT terminal_id, terminal_name, terminal_type, cabang_code, is_active
        FROM master_terminal 
        WHERE is_active = true AND terminal_type = 'ATM'
        ORDER BY terminal_name ASC
      `;
      
      const result = await atmDbClient.query(query);
      
      return result.rows.map(row => ({
        id: row.terminal_id,
        name: row.terminal_name,
        type: row.terminal_type,
        branchCode: row.cabang_code,
        isActive: row.is_active
      }));
    } catch (error) {
      console.error('Error fetching terminals from ATM database:', error);
      throw error;
    }
  },

  // Get branches in BSG Master Data format
  async getBranchesForBSG(): Promise<BSGMasterDataFormat[]> {
    const branches = await this.getBranches();
    
    return branches.map((branch, index) => ({
      value: branch.code,
      label: `${branch.name}${branch.region ? ` (${branch.region})` : ''}`,
      isDefault: index === 0 // Make first branch default
    }));
  },

  // Get terminals in BSG Master Data format
  async getTerminalsForBSG(): Promise<BSGMasterDataFormat[]> {
    const terminals = await this.getTerminals();
    
    return terminals.map((terminal, index) => ({
      value: terminal.id,
      label: `${terminal.name} (ID: ${terminal.id})`,
      isDefault: index === 0 // Make first terminal default
    }));
  },

  // Get terminals by branch
  async getTerminalsByBranch(branchCode: string): Promise<BSGMasterDataFormat[]> {
    await connectATMDatabase();
    
    try {
      const query = `
        SELECT terminal_id, terminal_name, terminal_type, cabang_code
        FROM master_terminal 
        WHERE is_active = true 
          AND terminal_type = 'ATM' 
          AND cabang_code = $1
        ORDER BY terminal_name ASC
      `;
      
      const result = await atmDbClient.query(query, [branchCode]);
      
      return result.rows.map((terminal, index) => ({
        value: terminal.terminal_id,
        label: `${terminal.terminal_name} (ID: ${terminal.terminal_id})`,
        isDefault: index === 0
      }));
    } catch (error) {
      console.error(`Error fetching terminals for branch ${branchCode}:`, error);
      throw error;
    }
  },

  // Close connection gracefully
  async disconnect(): Promise<void> {
    if (isConnected) {
      try {
        await atmDbClient.end();
        isConnected = false;
        console.log('✅ Disconnected from ATM Management System database');
      } catch (error) {
        console.error('❌ Error disconnecting from ATM Management System database:', error);
      }
    }
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await atmManagementService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await atmManagementService.disconnect();
  process.exit(0);
});

export default atmManagementService;