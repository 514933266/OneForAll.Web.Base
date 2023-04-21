var API = {
  KEY: 'OneForAll.Base',
  PERSONAL: {
    URL: '/api/SysPersonal',
    TENANT: '/api/SysPersonal/Tenant',
    HEADER: '/api/SysPersonal/Header',
    PASSWORD: '/api/SysPersonal/Password',
    MENU: '/api/SysPersonal/Menus'
  },
  PERSONAL_MESSAGE: {
    URL: '/api/SysPersonalMessages',
    UNREAD_COUNT: '/api/SysPersonalMessages/UnReadCount',
    READ: '/api/SysPersonalMessages/IsRead'
  },
  TENANT: {
    URL: '/api/SysTenants',
    BATCH_DELETE: '/api/SysTenants/Batch/IsDeleted',
    MENU: '/api/SysTenants/Current/MenuTrees'
  },
  AREA: {
    URL: '/api/SysAreas',
    PROVINCE: '/api/SysAreas/Provinces',
    CHILDREN: '/api/SysAreas/{id}/Children'
  },
  USER: {
    URL: '/api/SysTenantUsers',
    BATCH_PWD: '/api/SysTenantUsers/Batch/Password',
    BATCH_DELETE: '/api/SysTenantUsers/Batch/IsDeleted'
  },
  ROLE: {
    URL: '/api/SysTenantRoles',
    BATCH_DELETE: '/api/SysTenantRoles/Batch/IsDeleted',
    PERMISSION: '/api/SysTenantRoles/{id}/Permissions',
    MEMBER: '/api/SysTenantRoles/{id}/Members',
    MEMBER_BATCH_DELETE: '/api/SysTenantRoles/{id}/Members/Batch/IsDeleted',
    NOJOIN_MEMBER: '/api/SysTenantRoles/{id}/Users'
  },
  AREAGROUP: {
    URL: '/api/SysAreagroups',
    BATCH_DELETE: '/api/SysAreagroups/Batch/IsDeleted',
    PERMISSION: '/api/SysAreagroups/{id}/Areas',
    MEMBER: '/api/SysAreagroups/{id}/Members',
    MEMBER_BATCH_DELETE: '/api/SysAreagroups/{id}/Members/Batch/IsDeleted',
    NOJOIN_MEMBER: '/api/SysAreagroups/{id}/Users'
  },
  ARTICLE_TYPE: {
    URL: '/api/SysArticleTypes',
    ARTICLE: '/api/SysArticleTypes/{id}/Articles'
  },
  ARTICLE: {
    URL: '/api/SysArticles',
    COVER: '/api/SysArticles/{id}/Covers',
    IMAGE: '/api/SysArticles/{id}/Images',
    PUBLISH: '/api/SysArticles/{id}/Publish',
    RECORD: '/api/SysArticles/{id}/Records'
  },
  DEPARTMENT: {
    URL: '/api/SysDepartments',
    SORT: '/api/SysDepartments/{id}/SortNumber',
    USER: '/api/SysDepartments/{id}/Users',
    ROLE: '/api/SysDepartments/{id}/Roles',
    JOB: '/api/SysDepartments/{id}/Jobs',
    JOB_BATCH_DELETE: '/api/SysDepartments/{id}/Jobs/Batch/IsDeleted',
    JOB_ROLE_NOJOIN: '/api/SysDepartments/{id}/Jobs/{jobId}/UnJoined/Roles',
    JOB_USER_NOJOIN: '/api/SysDepartments/{id}/Jobs/{jobId}/UnJoined/Users',
    JOB_ROLE: '/api/SysDepartments/{id}/Jobs/{jobId}/Roles',
    JOB_USER: '/api/SysDepartments/{id}/Jobs/{jobId}/Users'
  }
}

export default API
