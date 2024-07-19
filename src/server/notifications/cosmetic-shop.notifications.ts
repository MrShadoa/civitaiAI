import { NotificationCategory } from '~/server/common/enums';
import { createNotificationProcessor } from '~/server/notifications/base.notifications';

export const cosmeticShopNotifications = createNotificationProcessor({
  // Moveable (if created through API)
  'cosmetic-shop-item-added-to-section': {
    defaultDisabled: true,
    displayName: 'Shop: New Products Available',
    category: NotificationCategory.System,
    prepareMessage: () => ({
      message: `New items have been added to the shop! Check 'em out now!`,
      url: `/shop`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH new_items AS (
        SELECT MAX(COALESCE(si."availableFrom", ssi."createdAt")) as last_item
        FROM "CosmeticShopSectionItem" ssi
        JOIN "CosmeticShopItem" si ON si.id = ssi."shopItemId"
        WHERE (ssi."createdAt" > '${lastSent}'::timestamp OR (si."availableFrom" BETWEEN '${lastSent}'::timestamp AND now()))
          AND (si."availableTo" >= NOW() OR si."availableTo" IS NULL)
      )
        SELECT
          CONCAT('cosmetic-shop-item-added-to-section:', '${lastSent}') "key",
          uns."userId" as "userId",
          'cosmetic-shop-item-added-to-section' as "type",
          '{}'::jsonb "details"
        FROM new_items ni
        JOIN "UserNotificationSettings" uns ON uns."type" = 'cosmetic-shop-item-added-to-section'
        WHERE ni.last_item IS NOT NULL
    `,
  },
  // Moveable
  'cosmetic-shop-item-sold': {
    displayName: "Shop: Your Item got bought (Creator's club exclusive)",
    category: NotificationCategory.System,
    prepareMessage: ({ details }) => ({
      message: `You got paid ${details.buzzAmount} Buzz for selling 1 "${details.shopItemTitle}" item`,
      url: `/user/transactions`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH sold_items AS (
        SELECT DISTINCT
          cp."buzzTransactionId",
          CAST(jsonb_array_elements(si.meta->'paidToUserIds') as INT) "ownerId",
          JSONB_BUILD_OBJECT(
            'shopItemTitle', si."title",
            'buzzAmount', FLOOR(si."unitAmount" / jsonb_array_length(si.meta->'paidToUserIds'))
          ) "details"
        FROM "UserCosmeticShopPurchases" cp
        JOIN "CosmeticShopItem" si ON si.id = cp."shopItemId"
        WHERE cp."purchasedAt" > '${lastSent}'::timestamp - INTERVAL '5 minutes' AND
        cp."purchasedAt" <= NOW() - INTERVAL '5 minutes'
      )
      SELECT
        CONCAT('cosmetic-shop-item-sold:',"buzzTransactionId") "key",
        "ownerId"    "userId",
        'cosmetic-shop-item-sold' "type",
        details
      FROM sold_items
    `,
  },
});
