import { uniqueId } from "lodash";

const Menuitems = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: "tabler:home-2",
    href: "",
    children: [
      {
        title: "Modern",
        icon: 'tabler:aperture',
        id: uniqueId(),
        href: "/",
      },
      {
        title: "eCommerce",
        icon: 'tabler:shopping-cart',
        id: uniqueId(),
        href: "/dashboards/eCommerce",
      },
      {
        id: uniqueId(),
        title: "Front Pages",
        icon: "tabler:app-window",
        href: "",
        children: [
          {
            title: "Homepage",
            id: uniqueId(),
            href: "/frontend-pages/homepage",
          },
          {
            title: "About Us",
            id: uniqueId(),
            href: "/frontend-pages/about",
          },
          {
            title: "Blog",
            id: uniqueId(),
            href: "/frontend-pages/blog/post",
          },
          {
            title: "Blog Details",
            id: uniqueId(),
            href: "/frontend-pages/blog/detail/streaming-video-way-before-it-was-cool-go-dark-tomorrow",
          },
          {
            title: "Contact Us",
            id: uniqueId(),
            href: "/frontend-pages/contact",
          },
          {
            title: "Portfolio",
            id: uniqueId(),
            href: "/frontend-pages/portfolio",
          },
          {
            title: "Pricing",
            id: uniqueId(),
            href: "/frontend-pages/pricing",
          },
        ],
      },
      // {
      //   title: "NFT",
      //   icon: 'tabler:currency-dollar',
      //   id: uniqueId(),
      //   href: "/dashboards/nft",
      // },
      // {
      //   title: "Crypto",
      //   icon: 'tabler:cpu',
      //   id: uniqueId(),
      //   href: "/dashboards/crypto",
      // },
      // {
      //   title: "General",
      //   icon: 'tabler:activity-heartbeat',
      //   id: uniqueId(),
      //   href: "/dashboards/general",
      // },
      // {
      //   title: "Music",
      //   icon: 'tabler:playlist',
      //   id: uniqueId(),
      //   href: "/dashboards/music",
      // }
    ],
  },
  {
    id: uniqueId(),
    title: "Apps",
    icon: "tabler:archive",
    href: "",
    children: [
      {
        id: uniqueId(),
        title: "Calendar",
        icon: "tabler:calendar",
        href: "/apps/calendar",
      },
      {
        id: uniqueId(),
        title: "Kanban",
        icon: "tabler:layout-kanban",
        href: "/apps/kanban",
      },
      {
        id: uniqueId(),
        title: "Chats",
        icon: "tabler:message-dots",
        href: "/apps/chats",
      },

      {
        id: uniqueId(),
        title: "Email",
        icon: "tabler:mail",
        href: "/apps/email",
      },
      
      {
        id: uniqueId(),
        title: "Notes",
        icon: "tabler:notes",
        href: "/apps/notes",
      },
      {
        id: uniqueId(),
        title: "Contacts",
        icon: "tabler:phone",
        href: "/apps/contacts",
      },
      {
        title: "Invoice",
        id: uniqueId(),
        icon: "tabler:file-text",
        href:"",
        children: [
          {
            id: uniqueId(),
            title: "List",
            href: "/apps/invoice/list",
          },
          {
            id: uniqueId(),
            title: "Details",
            href: "/apps/invoice/detail/PineappleInc",
          },
          {
            id: uniqueId(),
            title: "Create",
            href: "/apps/invoice/create",
          },
          {
            id: uniqueId(),
            title: "Edit",
            href: "/apps/invoice/edit/PineappleInc",
          },
        ],
      },
      {
        title: "User Profile",
        id: uniqueId(),
        icon: "tabler:user-circle",
        href:"",
        children: [
          {
            id: uniqueId(),
            title: "Profile",
            href: "/apps/user-profile/profile",
          },
          {
            id: uniqueId(),
            title: "Followers",
            href: "/apps/user-profile/followers",
          },
          {
            id: uniqueId(),
            title: "Friends",
            href: "/apps/user-profile/friends",
          },
          {
            id: uniqueId(),
            title: "Gallery",
            href: "/apps/user-profile/gallery",
          },
        ],
      },
      
     
    ],
  },


];
export default Menuitems;
