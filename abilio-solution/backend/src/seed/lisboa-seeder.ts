import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { TrackingSettings } from '../tracking-settings/entities/tracking-settings.entity';
import { Admin } from '../admin/entities/admin.entity';

const SALT_ROUNDS = 10;

// A continuous Lisbon trajectory:
// Cais do Sodré → Chiado → Baixa/Rossio → Av. da Liberdade → Marquês → Saldanha → Alameda → Oriente.
const LISBOA_WAYPOINTS: [number, number][] = [
  // Cais do Sodré / Ribeira das Naus
  [38.7067, -9.1450],
  [38.7072, -9.1440],
  [38.7078, -9.1430],
  [38.7085, -9.1421],

  // Chiado
  [38.7093, -9.1413],
  [38.7101, -9.1406],
  [38.7108, -9.1400],
  [38.7115, -9.1394],

  // Baixa / Rossio
  [38.7122, -9.1390],
  [38.7130, -9.1386], // Rossio
  [38.7137, -9.1383],
  [38.7145, -9.1381],

  // Av. da Liberdade up north
  [38.7152, -9.1380],
  [38.7162, -9.1379],
  [38.7172, -9.1377],
  [38.7182, -9.1375],
  [38.7192, -9.1372],
  [38.7202, -9.1369],

  // Marquês de Pombal / Parque Eduardo VII edge
  [38.7214, -9.1365], // Marquês
  [38.7224, -9.1360],
  [38.7235, -9.1353],

  // Saldanha
  [38.7246, -9.1345],
  [38.7256, -9.1336], // Saldanha
  [38.7265, -9.1326],
  [38.7274, -9.1316],

  // Alameda
  [38.7283, -9.1305],
  [38.7292, -9.1294],
  [38.7300, -9.1282],
  [38.7309, -9.1270], // Alameda

  // Areeiro / Olaias direction
  [38.7317, -9.1256],
  [38.7325, -9.1241],
  [38.7334, -9.1226],
  [38.7342, -9.1211],

  // Oriente / Parque das Nações
  [38.7350, -9.1193],
  [38.7359, -9.1176],
  [38.7368, -9.1158],
  [38.7377, -9.1141],
  [38.7386, -9.1124],
  [38.7395, -9.1108], // Gare do Oriente vicinity
];

function jitter(coord: number, meters: number): number {
  const delta = (meters / 111320) * (Math.random() - 0.5) * 2;
  return coord + delta;
}

async function run() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASS ?? 'postgres',
    database: process.env.DB_NAME ?? 'postgres',
    entities: [User, Location, TrackingSettings, Admin],
    synchronize: false,
  });

  await ds.initialize();

  const userRepo = ds.getRepository(User);
  const locationRepo = ds.getRepository(Location);
  const settingsRepo = ds.getRepository(TrackingSettings);
  const adminRepo = ds.getRepository(Admin);

  const existingAdmin = await adminRepo.find({ where: { email: 'admin@example.com' }, take: 1 });
  if (existingAdmin.length === 0) {
    const admin = adminRepo.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', SALT_ROUNDS),
    });
    await adminRepo.save(admin);
    console.log('Admin created: admin@example.com / admin123');
  }

  const existing = await userRepo.findOne({ where: { email: 'lisboa@test.com' } });
  if (existing) {
    await locationRepo.delete({ userId: existing.id });
    await userRepo.remove(existing);
  }

  const hashed = await bcrypt.hash('123456', SALT_ROUNDS);
  const user = userRepo.create({
    email: 'lisboa@test.com',
    password: hashed,
  });
  const savedUser = await userRepo.save(user);

  const twoHoursMs = 2 * 60 * 60 * 1000;
  const intervalMs = twoHoursMs / (LISBOA_WAYPOINTS.length - 1);
  const startTime = Date.now() - twoHoursMs;

  for (let i = 0; i < LISBOA_WAYPOINTS.length; i++) {
    const [lat, lon] = LISBOA_WAYPOINTS[i];
    const location = locationRepo.create({
      userId: savedUser.id,
      latitude: jitter(lat, 15),
      longitude: jitter(lon, 15),
      createdAt: new Date(startTime + i * intervalMs),
    });
    await locationRepo.save(location);
  }

  const allSettings = await settingsRepo.find({ order: { createdAt: 'DESC' }, take: 1 });
  let settings = allSettings[0] ?? null;
  if (!settings) {
    settings = settingsRepo.create({ minimumDistanceMeters: 50 });
    await settingsRepo.save(settings);
  } else {
    settings.minimumDistanceMeters = 50;
    await settingsRepo.save(settings);
  }

  await ds.destroy();
  console.log(
    'Lisboa seeder done: lisboa@test.com user, trajectory locations, TrackingSettings 50m. Admin: admin@example.com / admin123',
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

