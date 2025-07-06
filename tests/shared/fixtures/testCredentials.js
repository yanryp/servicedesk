// Test credentials for BSG Enterprise Ticketing System
// These credentials are used across all test suites for consistent authentication

const testCredentials = {
  // Admin users
  admin: {
    primary: {
      email: 'admin@bsg.co.id',
      password: 'password123',
      name: 'System Administrator',
      role: 'admin'
    },
    secondary: {
      email: 'super.admin@bsg.co.id',
      password: 'password123',
      name: 'Super Administrator',
      role: 'admin'
    }
  },

  // Branch managers (53 branches total)
  managers: {
    // Main CABANG branch managers
    utama: {
      email: 'utama.manager@bsg.co.id',
      password: 'password123',
      name: 'Manager Kantor Cabang Utama',
      role: 'manager',
      unitCode: 'UTAMA',
      unitType: 'CABANG',
      isBusinessReviewer: true
    },
    jakarta: {
      email: 'jakarta.manager@bsg.co.id',
      password: 'password123',
      name: 'Manager Kantor Cabang Jakarta',
      role: 'manager',
      unitCode: 'JAKARTA',
      unitType: 'CABANG',
      isBusinessReviewer: true
    },
    gorontalo: {
      email: 'gorontalo.manager@bsg.co.id',
      password: 'password123',
      name: 'Manager Kantor Cabang Gorontalo',
      role: 'manager',
      unitCode: 'GORONTALO',
      unitType: 'CABANG',
      isBusinessReviewer: true
    },
    
    // CAPEM branch managers
    kelapaGading: {
      email: 'kelapa.gading.manager@bsg.co.id',
      password: 'password123',
      name: 'Manager Kantor Cabang Pembantu Kelapa Gading',
      role: 'manager',
      unitCode: 'KELAPA_GADING',
      unitType: 'CAPEM',
      isBusinessReviewer: true
    },
    tuminting: {
      email: 'tuminting.manager@bsg.co.id',
      password: 'password123',
      name: 'Manager Kantor Cabang Pembantu Tuminting',
      role: 'manager',
      unitCode: 'TUMINTING',
      unitType: 'CAPEM',
      isBusinessReviewer: true
    }
  },

  // Technicians by department
  technicians: {
    // Banking Support Department (Dukungan dan Layanan)
    banking: {
      primary: {
        email: 'banking.tech@bsg.co.id',
        password: 'password123',
        name: 'Banking Systems Technician',
        role: 'technician',
        department: 'Dukungan dan Layanan'
      },
      secondary: {
        email: 'banking.support@bsg.co.id',
        password: 'password123',
        name: 'Banking Support Specialist',
        role: 'technician',
        department: 'Dukungan dan Layanan'
      }
    },

    // IT Department (Information Technology)
    it: {
      primary: {
        email: 'it.tech@bsg.co.id',
        password: 'password123',
        name: 'IT Support Technician',
        role: 'technician',
        department: 'Information Technology'
      },
      secondary: {
        email: 'network.admin@bsg.co.id',
        password: 'password123',
        name: 'Network Administrator',
        role: 'technician',
        department: 'Information Technology'
      },
      senior: {
        email: 'senior.it@bsg.co.id',
        password: 'password123',
        name: 'Senior IT Specialist',
        role: 'technician',
        department: 'Information Technology'
      }
    },

    // Government Services Department
    government: {
      primary: {
        email: 'kasda.tech@bsg.co.id',
        password: 'password123',
        name: 'KASDA Support Technician',
        role: 'technician',
        department: 'Government Services'
      }
    }
  },

  // Requesters by branch
  requesters: {
    // Main branch requesters
    utama: {
      staff: {
        email: 'utama.user@bsg.co.id',
        password: 'password123',
        name: 'Staff Kantor Cabang Utama',
        role: 'requester',
        unitCode: 'UTAMA',
        unitType: 'CABANG'
      },
      teller: {
        email: 'utama.teller@bsg.co.id',
        password: 'password123',
        name: 'Teller Kantor Cabang Utama',
        role: 'requester',
        unitCode: 'UTAMA',
        unitType: 'CABANG'
      }
    },

    jakarta: {
      staff: {
        email: 'jakarta.user@bsg.co.id',
        password: 'password123',
        name: 'Staff Kantor Cabang Jakarta',
        role: 'requester',
        unitCode: 'JAKARTA',
        unitType: 'CABANG'
      }
    },

    gorontalo: {
      staff: {
        email: 'gorontalo.user@bsg.co.id',
        password: 'password123',
        name: 'Staff Kantor Cabang Gorontalo',
        role: 'requester',
        unitCode: 'GORONTALO',
        unitType: 'CABANG'
      }
    },

    // CAPEM requesters
    kelapaGading: {
      staff: {
        email: 'kelapa.gading.user@bsg.co.id',
        password: 'password123',
        name: 'Staff Kantor Cabang Pembantu Kelapa Gading',
        role: 'requester',
        unitCode: 'KELAPA_GADING',
        unitType: 'CAPEM'
      }
    },

    tuminting: {
      staff: {
        email: 'tuminting.user@bsg.co.id',
        password: 'password123',
        name: 'Staff Kantor Cabang Pembantu Tuminting',
        role: 'requester',
        unitCode: 'TUMINTING',
        unitType: 'CAPEM'
      }
    }
  },

  // Test-specific accounts (for automated testing)
  testAccounts: {
    admin: {
      email: 'test.admin@bsg.co.id',
      password: 'testpass123',
      name: 'Test Administrator',
      role: 'admin'
    },
    manager: {
      email: 'test.manager@bsg.co.id',
      password: 'testpass123',
      name: 'Test Manager',
      role: 'manager',
      isBusinessReviewer: true
    },
    technician: {
      email: 'test.technician@bsg.co.id',
      password: 'testpass123',
      name: 'Test Technician',
      role: 'technician'
    },
    requester: {
      email: 'test.requester@bsg.co.id',
      password: 'testpass123',
      name: 'Test Requester',
      role: 'requester'
    }
  }
};

// Helper functions for test credentials
const credentialHelpers = {
  // Get credentials by role
  getByRole(role) {
    switch (role) {
      case 'admin':
        return testCredentials.admin.primary;
      case 'manager':
        return testCredentials.managers.utama;
      case 'technician':
        return testCredentials.technicians.banking.primary;
      case 'requester':
        return testCredentials.requesters.utama.staff;
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  },

  // Get credentials by branch
  getByBranch(branchCode, role = 'requester') {
    const branchKey = branchCode.toLowerCase().replace('_', '');
    
    if (role === 'manager') {
      return testCredentials.managers[branchKey] || testCredentials.managers.utama;
    }
    
    if (role === 'requester') {
      const branch = testCredentials.requesters[branchKey];
      return branch ? branch.staff : testCredentials.requesters.utama.staff;
    }
    
    throw new Error(`Unsupported role ${role} for branch credentials`);
  },

  // Get credentials by department
  getByDepartment(department, role = 'technician') {
    if (role !== 'technician') {
      throw new Error('Department-based credentials only available for technicians');
    }

    const deptKey = department.toLowerCase().replace(/\s+/g, '');
    
    switch (deptKey) {
      case 'dukungandanlayanan':
      case 'banking':
        return testCredentials.technicians.banking.primary;
      case 'informationtechnology':
      case 'it':
        return testCredentials.technicians.it.primary;
      case 'governmentservices':
      case 'kasda':
        return testCredentials.technicians.government.primary;
      default:
        return testCredentials.technicians.banking.primary;
    }
  },

  // Get test-specific credentials
  getTestAccount(role) {
    return testCredentials.testAccounts[role] || testCredentials.testAccounts.requester;
  },

  // Get all credentials for a specific role type
  getAllByRoleType(roleType) {
    switch (roleType) {
      case 'admin':
        return Object.values(testCredentials.admin);
      case 'manager':
        return Object.values(testCredentials.managers);
      case 'technician':
        return Object.values(testCredentials.technicians).flatMap(dept => Object.values(dept));
      case 'requester':
        return Object.values(testCredentials.requesters).flatMap(branch => Object.values(branch));
      default:
        return [];
    }
  },

  // Validate credentials object
  validateCredentials(creds) {
    const required = ['email', 'password', 'name', 'role'];
    return required.every(field => creds && creds[field]);
  },

  // Generate authentication headers for API testing
  getAuthHeaders(credentials) {
    // This would typically generate a JWT token
    // For now, return basic auth header format
    return {
      'Authorization': `Bearer ${Buffer.from(`${credentials.email}:${credentials.password}`).toString('base64')}`,
      'Content-Type': 'application/json'
    };
  }
};

module.exports = {
  testCredentials,
  credentialHelpers
};