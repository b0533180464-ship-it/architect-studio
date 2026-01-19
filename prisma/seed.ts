import { PrismaClient } from '@prisma/client';
import { getAllDefaultEntities } from '../src/server/routers/config/defaults';
import { DEFAULT_NAV_ITEMS, type DefaultNavItem } from '../src/components/layout/dynamic-sidebar/types';

const prisma = new PrismaClient();

async function seedConfigurableEntities(tenantId: string) {
  console.log('Seeding configurable entities for tenant:', tenantId);

  const allDefaults = getAllDefaultEntities();

  for (const { entityType, entities } of allDefaults) {
    console.log(`  Creating ${entities.length} ${entityType} entries...`);

    for (const entity of entities) {
      await prisma.configurableEntity.upsert({
        where: {
          tenantId_entityType_name: {
            tenantId,
            entityType,
            name: entity.name,
          },
        },
        update: {},
        create: {
          ...entity,
          entityType,
          tenantId,
          isActive: true,
        },
      });
    }
  }

  console.log('Done seeding configurable entities');
}

async function seedNavigationItems(tenantId: string) {
  console.log('Seeding navigation items for tenant:', tenantId);

  // Check if navigation items already exist for this tenant
  const existingCount = await prisma.navigationItem.count({
    where: { tenantId },
  });

  if (existingCount > 0) {
    console.log(`  Navigation items already exist (${existingCount}), skipping...`);
    return;
  }

  let order = 0;

  async function createNavItem(item: DefaultNavItem, parentId: string | null = null) {
    const navItem = await prisma.navigationItem.create({
      data: {
        tenantId,
        label: item.label,
        labelEn: item.labelEn || null,
        icon: item.icon || null,
        href: item.href || null,
        entityType: item.entityType || null,
        parentId,
        order: order++,
        isVisible: true,
        isCollapsed: false,
        isSystem: item.isSystem || false,
      },
    });

    // Create children if any
    if (item.children) {
      for (const child of item.children) {
        await createNavItem(child, navItem.id);
      }
    }
  }

  for (const item of DEFAULT_NAV_ITEMS) {
    await createNavItem(item);
  }

  console.log(`  Created ${order} navigation items`);
}

async function main() {
  console.log('Starting seed...');

  // Check if we have any tenants
  const tenants = await prisma.tenant.findMany({ take: 1 });

  if (tenants.length === 0) {
    console.log('No tenants found. Creating demo tenant...');

    const tenant = await prisma.tenant.create({
      data: {
        name: 'משרד דמו',
        slug: 'demo',
        email: 'demo@architect-studio.local',
        businessType: 'interior_design',
      },
    });

    console.log('Created tenant:', tenant.id);
    await seedConfigurableEntities(tenant.id);
    await seedNavigationItems(tenant.id);
  } else {
    console.log('Seeding for existing tenants...');
    for (const tenant of tenants) {
      await seedConfigurableEntities(tenant.id);
      await seedNavigationItems(tenant.id);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
