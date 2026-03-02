import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { TrackingSettings } from '../tracking-settings/entities/tracking-settings.entity';
import { Admin } from '../admin/entities/admin.entity';

const SALT_ROUNDS = 10;

const PORTO_WAYPOINTS: [number, number][] = [
  [41.1579, -8.6291],   // Ribeira
  [41.155, -8.627],
  [41.152, -8.624],
  [41.149, -8.618],
  [41.146, -8.614],
  [41.144, -8.612],      // near bridge
  [41.142, -8.610],
  [41.140, -8.609],      // Dom Luís I Bridge area
  [41.141, -8.608],
  [41.143, -8.607],
  [41.145, -8.607],
  [41.1476, -8.6074],    // Avenida dos Aliados
  [41.147, -8.608],
  [41.146, -8.610],
  [41.1458, -8.612],
  [41.1456, -8.6147],    // Clérigos Tower
  [41.146, -8.616],
  [41.148, -8.618],
  [41.150, -8.620],
  [41.152, -8.622],
  [41.154, -8.625],
  [41.156, -8.628],
  [41.158, -8.631],
  [41.159, -8.633],
  [41.1595, -8.635],
  [41.1589, -8.6382],    // Casa da Música
  [41.159, -8.638],
  [41.1585, -8.637],
  [41.158, -8.636],
  [41.1575, -8.635],
  [41.157, -8.634],
  [41.1565, -8.633],
  [41.156, -8.632],
  [41.1555, -8.631],
  [41.155, -8.630],
  [41.1545, -8.6295],
  [41.154, -8.629],
  [41.1535, -8.6285],
  [41.153, -8.628],
  [41.1525, -8.6275],
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

  const existing = await userRepo.findOne({ where: { email: 'porto@test.com' } });
  if (existing) {
    await locationRepo.delete({ userId: existing.id });
    await userRepo.remove(existing);
  }

  const hashed = await bcrypt.hash('123456', SALT_ROUNDS);
  const user = userRepo.create({
    email: 'porto@test.com',
    password: hashed,
  });
  const savedUser = await userRepo.save(user);

  const twoHoursMs = 2 * 60 * 60 * 1000;
  const intervalMs = twoHoursMs / (PORTO_WAYPOINTS.length - 1);
  const startTime = Date.now() - twoHoursMs;

  for (let i = 0; i < PORTO_WAYPOINTS.length; i++) {
    const [lat, lon] = PORTO_WAYPOINTS[i];
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
  console.log('Porto seeder done: porto@test.com user, 40 locations, TrackingSettings 50m. Admin: admin@example.com / admin123');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
