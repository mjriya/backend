import mongoose from "mongoose";

const CustomizeSchema = new mongoose.Schema(
  {
    navbar: [
      {
        icon: {
          type: String,
          default: null,
        },
        label: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              return !/\s/.test(v); // Ensure no spaces
            },
            message: (props) => `"${props.value}" contains spaces. Slugs must not have spaces.`,
          },
        },
      },
    ],
    featuredCategory: [
      {
        icon: {
          type: String,
          default: null,
        },
        label: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
          validate: {
            validator: function (v) {
              return !/\s/.test(v); // Ensure no spaces
            },
            message: (props) => `"${props.value}" contains spaces. Slugs must not have spaces.`,
          },
        },
      },
    ],
    homePageLayout: [
      {
        category: {
          label: String,
          slug: {
            type: String,
            validate: {
              validator: function (v) {
                return !/\s/.test(v); // Ensure no spaces
              },
              message: (props) => `"${props.value}" contains spaces. Slugs must not have spaces.`,
            },
          },
        },
        tag: {
          label: String,
          slug: {
            type: String,
            validate: {
              validator: function (v) {
                return !/\s/.test(v); // Ensure no spaces
              },
              message: (props) => `"${props.value}" contains spaces. Slugs must not have spaces.`,
            },
          },
        },
      },
    ],
  }
);

const Customize = mongoose.model("Customize", CustomizeSchema, "Customizes");

export { Customize };
