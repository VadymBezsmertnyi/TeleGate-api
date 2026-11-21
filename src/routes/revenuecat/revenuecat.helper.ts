import UserModel from "../users/users.model";
import { SUBSCRIPTION_TYPES_ENUM } from "../users/users.constants";
import {
  revenuecatReadOnlyClientV2,
  getCustomerSubscriptions,
} from "./revenuecat.client";
import {
  RevenueCatCustomersResponse,
  RevenueCatProjectsResponse,
} from "./revenuecat.types";

export const updateUserSubscriptionsFromRevenueCat = async () => {
  try {
    console.warn("Початок оновлення підписок користувачів з RevenueCat...");

    const projectsResponse =
      await revenuecatReadOnlyClientV2.get<RevenueCatProjectsResponse>(
        "/projects"
      );
    const projects = projectsResponse.data.items || [];

    let totalUsersProcessed = 0;
    let totalUsersUpdated = 0;

    for (const project of projects) {
      try {
        const customersResponse =
          await revenuecatReadOnlyClientV2.get<RevenueCatCustomersResponse>(
            `/projects/${project.id}/customers`
          );
        const customers = customersResponse.data.items || [];

        for (const customer of customers) {
          if (customer.id && !customer.id.includes("RCAnonymousID")) {
            totalUsersProcessed++;

            try {
              const user = await UserModel.findOne({
                telegramId: parseInt(customer.id),
              }).lean();

              if (user) {
                const subscriptionsResponse = await getCustomerSubscriptions(
                  project.id,
                  customer.id
                );
                const subscriptions =
                  subscriptionsResponse.data.subscriptions || {};

                let hasActiveSubscription = false;
                let latestExpiryDate = 0;
                let subscriptionType: (typeof SUBSCRIPTION_TYPES_ENUM)[number] =
                  "free";

                for (const [productId, subscriptionData] of Object.entries(
                  subscriptions
                )) {
                  if (
                    subscriptionData &&
                    typeof subscriptionData === "object" &&
                    "unsubscribe_detected_at" in subscriptionData
                  ) {
                    const subscription = subscriptionData as any;

                    if (subscription.unsubscribe_detected_at === null) {
                      hasActiveSubscription = true;

                      if (subscription.expires_date) {
                        const expiryTimestamp = new Date(
                          subscription.expires_date
                        ).getTime();
                        if (expiryTimestamp > latestExpiryDate) {
                          latestExpiryDate = expiryTimestamp;
                        }
                      }

                      if (
                        productId.includes("pro") ||
                        productId.includes("premium")
                      ) {
                        subscriptionType = "pro";
                      } else if (
                        productId.includes("ultimate") ||
                        productId.includes("unlimited")
                      ) {
                        subscriptionType = "ultimate";
                      }
                    }
                  }
                }

                const updateData: any = {
                  updatedAt: new Date(),
                };

                if (hasActiveSubscription) {
                  updateData.subscriptionType = subscriptionType;
                  updateData.subscriptionExpiresAt =
                    latestExpiryDate > 0 ? latestExpiryDate : null;
                } else {
                  updateData.subscriptionType = "free";
                  updateData.subscriptionExpiresAt = null;
                }

                await UserModel.findByIdAndUpdate(user._id, updateData);
                totalUsersUpdated++;

                console.warn(
                  `Оновлено підписку для користувача ${user.telegramId}: ${updateData.subscriptionType}`
                );
              }
            } catch (subscriptionError) {
              console.warn(
                `Помилка при обробці підписок для користувача ${customer.id}:`,
                subscriptionError
              );
            }
          }
        }
      } catch (projectError) {
        console.warn(
          `Помилка при обробці проекту ${project.id}:`,
          projectError
        );
      }
    }

    console.warn(
      `Оновлення підписок завершено. Оброблено: ${totalUsersProcessed}, Оновлено: ${totalUsersUpdated}`
    );

    return {
      success: true,
      totalUsersProcessed,
      totalUsersUpdated,
    };
  } catch (error) {
    console.warn(
      "Помилка при оновленні підписок користувачів з RevenueCat:",
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
