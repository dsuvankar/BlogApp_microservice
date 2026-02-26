import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: parseInt(process.env.RABBITMQ_PORT || "5672"),
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });

    channel = await connection.createChannel();

    console.log("✅ Connected to Rabbitmq");
  } catch (error) {
    console.error("❌ Failed to connect to Rabbitmq", error);
  }
};

export const publishToQueue = async (
  queueName: string,
  message: any,
): Promise<boolean> => {
  if (!channel) {
    console.error("Rabbitmq channel is not initialized");
    return false;
  }

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });

  return true;
};

export const invalidateCachingJob = async (cacheKeys: string[]) => {
  try {
    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };

    const published = await publishToQueue("cache-invalidation", message);

    if (published) {
      console.log("✅ Cache invalidation job published to Rabbitmq");
    }
  } catch (error) {
    console.error(
      "❌ Failed to publish cache invalidation job to Rabbitmq",
      error,
    );
  }
};
