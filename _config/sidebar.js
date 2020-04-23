const pages = config('pages') // Get Pages from config

//E-commerce
export default [
  {
    title: 'qfeed.sidebar.adminGroup',
    icon: 'fas fa-rss',
    children: [
      pages.qfeed.sources,//products index
    ]
  },
]
