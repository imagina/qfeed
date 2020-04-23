export default {
  //Sources list
  sources: {
    permission: null,
    activated: true,
    path: '/qfeed/sources',
    name: 'qfeed.admin.sources',
    page: () => import('@imagina/qfeed/_pages/admin/source/index'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qfeed.sidebar.adminSources',
    icon: 'fas fa-rss',
    authenticated: true,
  },
  //Product Create
  sourceCreate: {
    permission: null,
    activated: true,
    path: '/qfeed/sources/create',
    name: 'qfeed.admin.sources.create',
    page: () => import('@imagina/qfeed/_pages/admin/source/form'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qfeed.sidebar.adminSourceCreate',
    icon: 'fas fa-rss',
    authenticated: true,
  },
  //Product Update
  sourceEdit: {
    permission: null,
    activated: true,
    path: '/qfeed/source/:id',
    name: 'qfeed.admin.sources.edit',
    page: () => import('@imagina/qfeed/_pages/admin/source/form'),
    layout: () => import('@imagina/qsite/_layouts/master.vue'),
    title: 'qfeed.sidebar.adminSourceEdit',
    icon: 'fas fa-rss',
    authenticated: true,
  },
}
