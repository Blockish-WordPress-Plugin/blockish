const flowbite = require("flowbite-react/tailwind");

const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  darkMode: true,
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    ".php",
    flowbite.content(),
  ],
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      "2xl": "1536px", // Default value
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
  important: ".blockish",
});
