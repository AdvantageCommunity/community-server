import Redis from 'ioredis';

export const redis = new Redis({
  host: 'oregon-redis.render.com',
  port: 6379,
});
