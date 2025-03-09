import mongoose from "mongoose";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import OtpCode from "./models/OtpCode.js";
import AdminAnalytics from "./models/AdminAnalytics.js";
import OrderItem from "./models/OrderItem.js";
// You would also need your User model here
// import User from "./models/User.js";

// Import dotenv to load environment variables
import dotenv from "dotenv";
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      console.error(
        "DATABASE_URL is not defined in your environment variables. Using fallback for development."
      );
      // Fallback for development only
      await mongoose.connect("mongodb://localhost:27017/artGallery");
    } else {
      await mongoose.connect(DATABASE_URL);
    }

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Generate random user IDs (for testing purposes)
const generateRandomObjectId = () => new mongoose.Types.ObjectId();

// Sample users (you would use these IDs to reference in other collections)
const userIds = [
  generateRandomObjectId(),
  generateRandomObjectId(),
  generateRandomObjectId(),
  generateRandomObjectId(),
];

// Seed Products
const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});

    const productData = [
      {
        title: "Sunset Over Mountains",
        description:
          "A vibrant oil painting depicting a sunset over a mountain range, with rich oranges and purples reflecting on the snow-capped peaks.",
        price: 1200,
        imageUrl:
          "https://images.unsplash.com/photo-1617369120004-4fc70312c5e6",
        category: "Painting",
        tags: ["landscape", "mountains", "oil", "sunset"],
        stockQuantity: 1,
        isAvailable: true,
        featured: true,
        dimensions: {
          width: 60,
          height: 40,
          depth: 2,
          unit: "cm",
        },
        artist: "Elena Rodriguez",
        creationYear: 2022,
      },
      {
        title: "Abstract Emotions",
        description:
          "A mixed media artwork exploring human emotions through abstract shapes and bold colors.",
        price: 850,
        imageUrl:
          "https://images.unsplash.com/photo-1614696369359-a5c7a7cd9d25",
        category: "Mixed Media",
        tags: ["abstract", "emotions", "colorful", "contemporary"],
        stockQuantity: 1,
        isAvailable: true,
        featured: true,
        dimensions: {
          width: 50,
          height: 50,
          depth: 3,
          unit: "cm",
        },
        artist: "Marcus Chen",
        creationYear: 2023,
      },
      {
        title: "Midnight Forest",
        description:
          "A haunting digital art piece showing a moonlit forest with mysterious glowing elements.",
        price: 450,
        imageUrl:
          "https://images.unsplash.com/photo-1518406616186-6d180412eb13",
        category: "Digital Art",
        tags: ["forest", "night", "digital", "mysterious"],
        stockQuantity: 5,
        isAvailable: true,
        featured: false,
        dimensions: {
          width: 40,
          height: 30,
          unit: "cm",
        },
        artist: "Sophia Williams",
        creationYear: 2023,
      },
      {
        title: "Urban Reflections",
        description:
          "A black and white photography print capturing rain-soaked city streets with reflections of skyscrapers.",
        price: 350,
        imageUrl:
          "https://images.unsplash.com/photo-1608501078713-8e445a709b39",
        category: "Photography",
        tags: ["urban", "black and white", "city", "reflections"],
        stockQuantity: 10,
        isAvailable: true,
        featured: false,
        dimensions: {
          width: 60,
          height: 40,
          unit: "cm",
        },
        artist: "James Thompson",
        creationYear: 2021,
      },
      {
        title: "Eternal Embrace",
        description:
          "A marble sculpture depicting two figures in an eternal embrace, symbolizing love and connection.",
        price: 3500,
        imageUrl:
          "https://images.unsplash.com/photo-1575224526797-5730d09d781d",
        category: "Sculpture",
        tags: ["marble", "love", "figures", "classical"],
        stockQuantity: 1,
        isAvailable: true,
        featured: true,
        dimensions: {
          width: 30,
          height: 45,
          depth: 20,
          unit: "cm",
        },
        artist: "Isabella Romano",
        creationYear: 2022,
      },
      {
        title: "Serenity Waves",
        description:
          "A calming seascape painting featuring gentle waves at sunset with a minimalist approach.",
        price: 680,
        imageUrl:
          "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
        category: "Painting",
        tags: ["seascape", "waves", "sunset", "minimalist"],
        stockQuantity: 2,
        isAvailable: true,
        featured: false,
        dimensions: {
          width: 80,
          height: 40,
          depth: 2,
          unit: "cm",
        },
        artist: "Nathan Lee",
        creationYear: 2022,
      },
      {
        title: "Geometric Balance",
        description:
          "A series of limited edition prints exploring geometric shapes and balance in composition.",
        price: 275,
        imageUrl:
          "https://images.unsplash.com/photo-1619266465172-02a857c3556d",
        category: "Prints",
        tags: ["geometric", "balance", "limited edition", "modern"],
        stockQuantity: 15,
        isAvailable: true,
        featured: false,
        dimensions: {
          width: 50,
          height: 50,
          unit: "cm",
        },
        artist: "Olivia Parker",
        creationYear: 2023,
      },
    ];

    const createdProducts = await Product.insertMany(productData);
    console.log(`${createdProducts.length} products have been created.`);
    return createdProducts;
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
};

// Seed Orders
const seedOrders = async (products) => {
  try {
    // Clear existing orders
    await Order.deleteMany({});

    const orderStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const shippingMethods = ["Standard", "Express", "Overnight"];
    const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer"];

    const orders = [];

    for (let i = 0; i < userIds.length; i++) {
      // Each user will have 1-3 orders
      const numOrders = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numOrders; j++) {
        // Select 1-3 random products for each order
        const numProducts = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let subtotal = 0;

        for (let k = 0; k < numProducts; k++) {
          const randomProduct =
            products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1;
          const price = randomProduct.price;

          orderItems.push({
            productId: randomProduct._id,
            title: randomProduct.title,
            price: price,
            quantity: quantity,
            imageUrl: randomProduct.imageUrl,
          });

          subtotal += price * quantity;
        }

        const shippingCost = 15;
        const tax = subtotal * 0.08;
        const totalAmount = subtotal + shippingCost + tax;
        const status =
          orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

        // Generate order number manually since insertMany doesn't trigger pre-save hooks
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        const orderNumber = `ORD-${timestamp}-${random}`;

        const order = {
          userId: userIds[i],
          orderNumber: orderNumber, // Add orderNumber
          items: orderItems,
          status: status,
          shippingAddress: {
            name: "John Doe",
            street: "123 Main St",
            city: "Artville",
            state: "CA",
            zip: "90210",
            country: "USA",
          },
          shippingMethod:
            shippingMethods[Math.floor(Math.random() * shippingMethods.length)],
          paymentMethod:
            paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          subtotal: subtotal,
          shippingCost: shippingCost,
          tax: tax,
          totalAmount: totalAmount,
          notes: "Please handle with care",
          statusHistory: [
            {
              status: status,
              timestamp: new Date(),
              note: "Initial order status",
            },
          ],
        };

        // Add tracking number if shipped or delivered
        if (status === "shipped" || status === "delivered") {
          order.trackingNumber = `TRK${Math.random().toString().slice(2, 11)}`;
        }

        orders.push(order);
      }
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`${createdOrders.length} orders have been created.`);
    return createdOrders;
  } catch (error) {
    console.error("Error seeding orders:", error);
    throw error;
  }
};

// Seed Order Items (separate collection)
const seedOrderItems = async (orders) => {
  try {
    // Clear existing order items
    await OrderItem.deleteMany({});

    const orderItems = [];

    for (const order of orders) {
      for (const item of order.items) {
        orderItems.push({
          orderId: order._id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }
    }

    const createdOrderItems = await OrderItem.insertMany(orderItems);
    console.log(`${createdOrderItems.length} order items have been created.`);
  } catch (error) {
    console.error("Error seeding order items:", error);
    throw error;
  }
};

// Seed OTP Codes
const seedOtpCodes = async () => {
  try {
    // Clear existing OTP codes
    await OtpCode.deleteMany({});

    const purposes = ["registration", "password_reset"];
    const otpCodes = [];

    for (let i = 0; i < userIds.length; i++) {
      const purpose = purposes[Math.floor(Math.random() * purposes.length)];
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // Expires in 1 hour

      otpCodes.push({
        userId: userIds[i],
        code: Math.floor(100000 + Math.random() * 900000).toString(), // 6-digit code
        purpose: purpose,
        expiresAt: expiryDate,
        used: false,
      });
    }

    const createdOtpCodes = await OtpCode.insertMany(otpCodes);
    console.log(`${createdOtpCodes.length} OTP codes have been created.`);
  } catch (error) {
    console.error("Error seeding OTP codes:", error);
    throw error;
  }
};

// Seed Admin Analytics
const seedAdminAnalytics = async (products) => {
  try {
    // Clear existing analytics data
    await AdminAnalytics.deleteMany({});

    const categories = [
      "Painting",
      "Sculpture",
      "Photography",
      "Digital Art",
      "Prints",
      "Mixed Media",
    ];
    const adminAnalytics = [];

    for (const product of products) {
      // Generate random view and purchase counts
      const viewCount = Math.floor(Math.random() * 1000) + 50;
      const purchaseCount = Math.floor(Math.random() * 20);
      const revenue = purchaseCount * product.price;

      // Generate weekly stats for the past 4 weeks
      const weeklyStats = [];
      const currentDate = new Date();

      for (let i = 0; i < 4; i++) {
        const weekDate = new Date(currentDate);
        weekDate.setDate(weekDate.getDate() - i * 7);

        const weekNumber = getWeekNumber(weekDate);
        const weekViews = Math.floor(Math.random() * 200) + 10;
        const weekPurchases = Math.floor(Math.random() * 5);
        const weekRevenue = weekPurchases * product.price;

        weeklyStats.push({
          week: `${weekDate.getFullYear()}-${weekNumber
            .toString()
            .padStart(2, "0")}`,
          views: weekViews,
          purchases: weekPurchases,
          revenue: weekRevenue,
        });
      }

      // Generate category performance
      const categoryPerformance = {};

      for (const category of categories) {
        categoryPerformance[category] = {
          views: Math.floor(Math.random() * 100) + 5,
          purchases: Math.floor(Math.random() * 3),
          revenue: Math.floor(Math.random() * 3) * product.price,
        };
      }

      adminAnalytics.push({
        productId: product._id,
        viewCount: viewCount,
        purchaseCount: purchaseCount,
        revenue: revenue,
        weeklyStats: weeklyStats,
        categoryPerformance: categoryPerformance,
      });
    }

    const createdAnalytics = await AdminAnalytics.insertMany(adminAnalytics);
    console.log(
      `${createdAnalytics.length} admin analytics records have been created.`
    );
  } catch (error) {
    console.error("Error seeding admin analytics:", error);
    throw error;
  }
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Starting database seeding...");

    // Seed collections
    const products = await seedProducts();
    const orders = await seedOrders(products);
    await seedOrderItems(orders);
    await seedOtpCodes();
    await seedAdminAnalytics(products);

    console.log("Database seeding completed successfully!");

    // Disconnect from database
    await mongoose.connection.close();
    console.log("Disconnected from MongoDB");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
