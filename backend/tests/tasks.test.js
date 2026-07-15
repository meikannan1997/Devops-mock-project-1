const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, connectDB } = require('../index');
const Task = require('../models/Task');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();
    await connectDB();
});

afterEach(async () => {
    await Task.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Tasks API', () => {
    test('GET /api/tasks returns an empty list initially', async () => {
        const res = await request(app).get('/api/tasks');

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test('POST /api/tasks creates a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({ text: 'Learn Jest' });

        expect(res.status).toBe(200);
        expect(res.body.text).toBe('Learn Jest');
        expect(res.body._id).toBeDefined();
    });

    test('GET /api/tasks returns all tasks', async () => {
        await Task.create({ text: 'Write tests' });
        await Task.create({ text: 'Run CI pipeline' });

        const res = await request(app).get('/api/tasks');

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body.map((task) => task.text)).toEqual(
            expect.arrayContaining(['Write tests', 'Run CI pipeline'])
        );
    });

    test('DELETE /api/tasks/:id removes a task', async () => {
        const task = await Task.create({ text: 'Delete me' });

        const res = await request(app).delete(`/api/tasks/${task._id}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Task deleted');

        const remaining = await Task.find();
        expect(remaining).toHaveLength(0);
    });
});
