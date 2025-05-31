import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../config/database.config";
import { LoginDto, RegisterDto } from "../database/dto/auth.dto";
import { User } from "../database/entities/user.entity";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/app-error";
import { Availability } from "../database/entities/availability.entity";
import {
  DayAvailability,
  DayOfWeekEnum,
} from "../database/entities/day-availability";
import { signJwtToken } from "../utils/jwt";


/**
 * Genera un sufijo aleatorio de 3 letras + 3 números
 * Ejemplo: "abc123", "xyz789", "def456"
 */
function generateRandomSuffix(): string {
  // Generar 3 letras aleatorias (a-z)
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('');

  // Generar 3 números aleatorios (0-9)
  const numbers = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');

  return numbers + letters;
}

/**
 * Registers a new user.
 * @param registerDto - The registration data.
 * @returns The registered user without the password.
 */
export const registerService = async (registerDto: RegisterDto) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);
  const dayAvailabilityRepository =
    AppDataSource.getRepository(DayAvailability);

  const existingUser = await userRepository.findOne({
    where: { email: registerDto.email },
  });
  if (existingUser) {
    throw new BadRequestException("User already exists");
  }
  const username = await generateUsername(registerDto.name);
  console.log("Generated username:", username);
  const user = userRepository.create({
    ...registerDto,
    username,
  });
  console.log("User created:", user);
  const availability = availabilityRepository.create({
    timeGap: 30,
    days: Object.values(DayOfWeekEnum).map((day) => {
      return dayAvailabilityRepository.create({
        day: day,
        startTime: new Date(`2025-03-01T09:00:00Z`), //9:00
        endTime: new Date(`2025-03-01T17:00:00Z`), //5:00pm
        isAvailable:
          day !== DayOfWeekEnum.SUNDAY && day !== DayOfWeekEnum.SATURDAY,
      });
    }),
  });
  user.availability = availability;
  await userRepository.save(user);
  return { user: user.omitPassword() };
};


/**
 * Logs in an existing user.
 * @param loginDto - The login credentials.
 * @returns The logged-in user and access token.
 */
export const loginService = async (loginDto: LoginDto) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { email: loginDto.email },
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const isPasswordValid = await user.comparePassword(loginDto.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid email/password");
  }

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
  };
};

/**
 * Generates a unique username based on the user's name.
 * @param name - The user's name.
 * @returns A unique username.
 */
async function generateUsername(name: string): Promise<string> {
  try {
    const cleanName = name
      .replace(/[^a-zA-Z0-9]/g, '') // Elimina caracteres especiales y espacios
      .toLowerCase()
      .slice(0, 20); // Limita a 20 caracteres para evitar usernames muy largos
    const baseUsername = cleanName || 'user'; // Fallback si el nombre queda vacío
    let username = `${baseUsername}${generateRandomSuffix()}`;
    return username;
  } catch (error) {
    console.error("Error generating username:", error);
    throw new BadRequestException("Error generating username");
  }
}


// import { v4 as uuidv4 } from "uuid";
// import { AppDataSource } from "../config/database.config";
// import { LoginDto, RegisterDto } from "../database/dto/auth.dto";
// import { User } from "../database/entities/user.entity";
// import {
//   BadRequestException,
//   NotFoundException,
//   UnauthorizedException,
// } from "../utils/app-error";
// import { Availability } from "../database/entities/availability.entity";
// import {
//   DayAvailability,
//   DayOfWeekEnum,
// } from "../database/entities/day-availability";
// import { signJwtToken } from "../utils/jwt";

// export const registerService = async (registerDto: RegisterDto) => {
//   const userRepository = AppDataSource.getRepository(User);
//   const availabilityRepository = AppDataSource.getRepository(Availability);
//   const dayAvailabilityRepository =
//     AppDataSource.getRepository(DayAvailability);

//   const existingUser = await userRepository.findOne({
//     where: { email: registerDto.email },
//   });

//   if (existingUser) {
//     throw new BadRequestException("User already exists");
//   }

//   const username = await generateUsername(registerDto.name);
//   const user = userRepository.create({
//     ...registerDto,
//     username,
//   });

//   const availability = availabilityRepository.create({
//     timeGap: 30,
//     days: Object.values(DayOfWeekEnum).map((day) => {
//       return dayAvailabilityRepository.create({
//         day: day,
//         startTime: new Date(`2025-03-01T09:00:00Z`), //9:00
//         endTime: new Date(`2025-03-01T17:00:00Z`), //5:00pm
//         isAvailable:
//           day !== DayOfWeekEnum.SUNDAY && day !== DayOfWeekEnum.SATURDAY,
//       });
//     }),
//   });

//   user.availability = availability;

//   await userRepository.save(user);

//   return { user: user.omitPassword() };
// };

// export const loginService = async (loginDto: LoginDto) => {
//   const userRepository = AppDataSource.getRepository(User);

//   const user = await userRepository.findOne({
//     where: { email: loginDto.email },
//   });

//   if (!user) {
//     throw new NotFoundException("User not found");
//   }

//   const isPasswordValid = await user.comparePassword(loginDto.password);
//   if (!isPasswordValid) {
//     throw new UnauthorizedException("Invalid email/password");
//   }

//   const { token, expiresAt } = signJwtToken({ userId: user.id });

//   return {
//     user: user.omitPassword(),
//     accessToken: token,
//     expiresAt,
//   };
// };

// async function generateUsername(name: string): Promise<string> {
//   const cleanName = name.replace(/\s+/g, "").toLowerCase();
//   const baseUsername = cleanName;

//   const uuidSuffix = uuidv4().replace(/\s+/g, "").slice(0, 4);
//   const userRepository = AppDataSource.getRepository(User);

//   let username = `${baseUsername}${uuidSuffix}`;
//   let existingUser = await userRepository.findOne({
//     where: { username },
//   });

//   while (existingUser) {
//     username = `${baseUsername}${uuidv4().replace(/\s+/g, "").slice(0, 4)}`;
//     existingUser = await userRepository.findOne({
//       where: { username },
//     });
//   }

//   return username;
// }
