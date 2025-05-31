import "dotenv/config";
import { DataSource } from "typeorm";
import { config } from "./app.config";

export const getDatabaseConfig = () => {
  const isProduction = config.NODE_ENV ? config.NODE_ENV === "production" : false;
  const databaseUrl = config.DATABASE_URL;

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    logging: false, // ← Desactivar logs de SQL
    ssl: databaseUrl.includes('supabase')
      ? { rejectUnauthorized: false }  // Supabase con SSL
      : false,  // Docker sin SSL
    entities: ["src/database/entities/*.ts"], // ← Patrón de archivos
    synchronize: false, // ← IMPORTANTE: false porque las tablas ya existen
  });
};

export const AppDataSource = getDatabaseConfig();

// import "dotenv/config";
// import path from "path";
// import { DataSource } from "typeorm";

// import { config } from "./app.config";

// export const getDatabaseConfig = () => {
//   const isProduction = config.NODE_ENV === "production";
//   const databaseUrl = config.DATABASE_URL;

//   return new DataSource({
//     type: "postgres",
//     url: databaseUrl,
//     entities: [path.join(__dirname, "../database/entities/*{.ts,.js}")],
//     // migrations: [path.join(__dirname, "../database/migrations/*{.ts,.js}")],
//     synchronize: !isProduction,
//     logging: isProduction ? false : ["error"],
//     ssl: isProduction
//       ? {
//           rejectUnauthorized: true,
//         }
//       : {
//           rejectUnauthorized: false,
//         },
//   });
// };

// export const AppDataSource = getDatabaseConfig();
