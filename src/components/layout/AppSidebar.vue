<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'py-8 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
    >
      <router-link to="/">
        <span
          v-if="isExpanded || isHovered || isMobileOpen"
          class="ml-2 text-lg font-semibold text-gray-900 dark:text-white"
          >Bylin</span
        >
        <span
          v-else
          class="ml-2 text-lg font-semibold text-gray-900 dark:text-white"
          >B</span
        >
      </router-link>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar"
    >
      <nav class="mb-6">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpen(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpen(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpen(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                  <ChevronDownIcon
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpen(
                          groupIndex,
                          index
                        ),
                      },
                    ]"
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpen(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(
                                subItem.path
                              ),
                              'menu-dropdown-item-inactive': !isActive(
                                subItem.path
                              ),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              new
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(
                                    subItem.path
                                  ),
                                  'menu-dropdown-badge-inactive': !isActive(
                                    subItem.path
                                  ),
                                },
                              ]"
                            >
                              pro
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" />
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import {
  GridIcon,
  CalenderIcon,
  UserCircleIcon,
  // ChatIcon,
  // MailIcon,
  // DocsIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontalDots,
  // PageIcon,
  TableIcon,
  ListIcon,
  PlugInIcon,
  // BanknotesIcon 
} from "../../icons";
import SidebarWidget from "./SidebarWidget.vue";
import BoxCubeIcon from "@/icons/BoxCubeIcon.vue";
import { useSidebar } from "@/composables/useSidebar";

const route = useRoute();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

const menuGroups = [
  {
    title: "Menu",
    items: [
      {
        icon: GridIcon,
        name: "Tableau de Bord",
        path: "/",
      },
      {
        icon: CalenderIcon,
        name: "Commandes",
        subItems: [
          {name: "Liste des commandes", path: "/orders", pro: false},
          // {name: "Gestion des retours", path: "/form-elements", pro: false},
        ],
      },
      {
        icon: UserCircleIcon,
        name: "Produits ",
        subItems: [
          {name: "Liste des produits", path: "/products", pro: false},
          {name: "Ajout d’un produit", path: "/add-product", pro: false},
          // {name: "Gestion des stocks", path: "/gestion-stock", pro: false},
          {name: "Catégories & Marques", path: "/categories_and_brands", pro: false},
          {name: "Couleurs & Tailles", path: "/attributes", pro: false},
          // {name: "Promotions et offres", path: "/form-elements", pro: false},
        ],
      },
      {
        name: "Clients",
        icon: ListIcon,
        subItems: [
          { name: "Liste des clients", path: "/customers", pro: false },
          { name: "Messagerie", path: "/messaging", pro: false },
          { name: "Avis clients", path: "/products/reviews", pro: false },
        ],
      },
      {
        name: "Livraison",
        icon: TableIcon,
        subItems: [
          { name: "Paramètres de livraison", path: "/shipping-settings", pro: false },
          { name: "Suivi des expéditions", path: "/shipping-tracking", pro: false },
          { name: "Gestion des retards", path: "/delay-management", pro: false }

        ],
      },
      {
        name: "Paiements et Facturation",
        icon: TableIcon,
        subItems: [
          { name: "Transactions", path: "/transactions", pro: false },
          { name: "Remboursements", path: "/refunds", pro: false },
          { name: "Factures", path: "/invoices", pro: false },
          { name: "Intégrations", path: "/integrations", pro: false },
        ],
      },
    ],
  },
  {
    title: "Reglages",
    items: [
      {
        icon: PieChartIcon,
        name: "Marketing",
        subItems: [
          { name: "Campagnes", path: "/line-chart", pro: false },
          { name: "Publicités", path: "/bar-chart", pro: false },
          { name: "SEO", path: "/area-chart", pro: false },
          { name: "Réseaux sociaux", path: "/radar-chart", pro: false },
          { name: "Analyse de marché", path: "/pie-chart", pro: false },
          { name: "Partenariats", path: "/doughnut-chart", pro: false },
        ],
      },
      {
        icon: BoxCubeIcon,
        name: "Analytiques & Rapports",
        subItems: [
          { name: "Rapports de ventes", path: "/line-chart", pro: false },
          { name: "Analyse des clients", path: "/bar-chart", pro: false },
          { name: "Performance des produits", path: "/area-chart", pro: false },
          { name: "Rapports financiers", path: "/radar-chart", pro: false },
          { name: "Tableaux de bord personnalisés", path: "/pie-chart", pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: "Paramètres",
        subItems: [
          { name: "Configuration du site", path: "/form-elements", pro: false },
          { name: "Gestion des utilisateurs", path: "/form-elements", pro: false },
          { name: "Sécurité et confidentialité", path: "/form-elements", pro: false },
          { name: "Intégrations tierces", path: "/form-elements", pro: false },
          { name: "Support et assistance", path: "/form-elements", pro: false },
        ],
      },
      // ... Add other menu items here
    ],
  },
];

const isActive = (path) => route.path === path;

const toggleSubmenu = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path))
    )
  );
});

const isSubmenuOpen = (groupIndex, itemIndex) => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    openSubmenu.value === key ||
    (isAnySubmenuRouteActive.value &&
      menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path)
      ))
  );
};

const startTransition = (el) => {
  el.style.height = "auto";
  const height = el.scrollHeight;
  el.style.height = "0px";
  el.offsetHeight; // force reflow
  el.style.height = height + "px";
};

const endTransition = (el) => {
  el.style.height = "";
};
</script>
