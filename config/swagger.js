import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Address Logger API",
      version: "1.0.0",
      description: "Citizen address logging system"
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer" } }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./src/routes/*.js"]
};

export const swaggerSpec = swaggerJSDoc(options);
