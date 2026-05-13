export type AppRole = 'ADMIN' | 'ORGANIZER' | 'USER';
export type Permission = keyof typeof CAN;

// Define which roles can perform each action.
// Add a new key here whenever a new gated section is needed.
export const CAN = {
  // Org management
  createOrg:      ['ADMIN'] as AppRole[],
  editOrg:        ['ADMIN'] as AppRole[],
  deleteOrg:      ['ADMIN'] as AppRole[],
  verifyOrg:      ['ADMIN'] as AppRole[],
  viewOrgDocs:    ['ADMIN', 'ORGANIZER'] as AppRole[],

  // User management
  addUser:        ['ADMIN'] as AppRole[],
  editUser:       ['ADMIN'] as AppRole[],
  viewUserList:   ['ADMIN', 'ORGANIZER'] as AppRole[],

  // Resource management
  deleteResource: ['ADMIN'] as AppRole[],
  assignResource: ['ADMIN'] as AppRole[],
  editResource:   ['ADMIN', 'ORGANIZER'] as AppRole[],
};

export function hasPermission(role: AppRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return CAN[permission].includes(role);
}
