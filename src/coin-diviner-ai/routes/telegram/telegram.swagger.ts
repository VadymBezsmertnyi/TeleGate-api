/**
 * @swagger
 * tags:
 *   name: Telegram
 *   description: Telegram bot webhook management
 */

/**
 * @swagger
 * /coin-diviner-ai/api/telegram/webhook:
 *   post:
 *     summary: Telegram webhook endpoint
 *     tags: [Telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received successfully
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /coin-diviner-ai/api/telegram/set-webhook:
 *   post:
 *     summary: Set Telegram webhook URL
 *     tags: [Telegram]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://your-domain.com/coin-diviner-ai/api/telegram/webhook
 *     responses:
 *       200:
 *         description: Webhook set successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
