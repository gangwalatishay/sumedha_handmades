// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema(
//   {
//     /* =====================================
//        BASIC INFO
//     ===================================== */

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     image: {
//       type: String,
//       default: "",
//     },

//     /* =====================================
//        PRICING
//     ===================================== */

//     price: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     salePrice: {
//       type: Number,
//       default: null,
//       min: 0,
//     },

//     /* =====================================
//        GIFT OCCASIONS
//     ===================================== */

//     categories: [
//       {
//         type: String,

//         enum: [
//           "birthday",
//           "anniversary",
//           "wedding",
//           "long-distance",
//           "love",
//           "surprise",
//           "apology",
//           "proposal",
//           "friendship",
//           "baby",
//         ],
//       },
//     ],

//     /* =====================================
//        PRODUCT TYPE
//     ===================================== */

//     category: {
//       type: String,
//       default: "handmade",
//       trim: true,
//     },

//     /* =====================================
//        INVENTORY
//     ===================================== */

//     stock: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     inStock: {
//       type: Boolean,
//       default: true,
//     },

//     /* =====================================
//        HOMEPAGE / MERCHANDISING
//     ===================================== */

//     featured: {
//       type: Boolean,
//       default: false,
//     },

//     bestseller: {
//       type: Boolean,
//       default: false,
//     },

//     trending: {
//       type: Boolean,
//       default: false,
//     },

//     /* =====================================
//        RATINGS
//     ===================================== */

//     rating: {
//       type: Number,
//       default: 4.8,
//       min: 0,
//       max: 5,
//     },

//     reviewsCount: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     /* =====================================
//        GST / HSN
//     ===================================== */

//     hsnCode: {
//       type: String,
//       default: "7117",
//       trim: true,
//     },
//   },

//   {
//     timestamps: true,
//   }
// );

// /* =====================================
//    AUTO STOCK STATUS
// ===================================== */

// productSchema.pre(
//   "save",
//   function (next) {

//     this.inStock =
//       this.stock > 0;

//     next();
//   }
// );

// module.exports =
//   mongoose.model(
//     "Product",
//     productSchema
//   );

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    /* =====================================
       BASIC INFO
    ===================================== */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
    media: [
      {
        url: String,

        type:{
          type: String,
          enum: [
            "image",
            "video",
          ],
        },
      },
    ],


    /* =====================================
       PRICING
    ===================================== */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /* OPTIONAL SALE PRICE */

    salePrice: {
      type: Number,
      min: 0,
    },

    /* =====================================
       GIFT OCCASIONS
    ===================================== */

    categories: [
      {
        type: String,

        enum: [
          "birthday",
          "anniversary",
          "wedding",
          "long-distance",
          "love",
          "surprise",
          "apology",
          "proposal",
          "friendship",
          "baby",
        ],
      },
    ],

    /* =====================================
       PRODUCT TYPE
    ===================================== */

    category: {
      type: String,
      default: "handmade",
      trim: true,
    },

    /* =====================================
       INVENTORY
    ===================================== */

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    /* =====================================
       HOMEPAGE / MERCHANDISING
    ===================================== */

    featured: {
      type: Boolean,
      default: false,
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    trending: {
      type: Boolean,
      default: false,
    },

    /* =====================================
       RATINGS
    ===================================== */

    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },

    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =====================================
       GST / HSN
    ===================================== */

    hsnCode: {
      type: String,
      default: "7117",
      trim: true,
    },
  },

  {
    timestamps: true,
  }
);

productSchema.pre("validate", function () {
  this.inStock = Number(this.stock || 0) > 0;
  if (this.salePrice != null && this.salePrice > this.price) {
    this.invalidate("salePrice", "Sale price cannot be higher than the regular price");
  }
  if (!Number.isInteger(Number(this.stock || 0))) {
    this.invalidate("stock", "Stock must be a whole number");
  }
});

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );
