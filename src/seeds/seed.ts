import mongoose from 'mongoose';
import { config } from '../config';
import { User, Project, Task } from '../models';

const seed = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const member = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users');

    // Create projects
    const project1 = await Project.create({
      title: 'E-Commerce Platform',
      description: 'Building a full-stack e-commerce platform with payment integration',
      status: 'active',
      owner: admin._id,
    });

    const project2 = await Project.create({
      title: 'Mobile App Redesign',
      description: 'Redesigning the mobile app UI/UX for better user experience',
      status: 'active',
      owner: member._id,
    });

    const project3 = await Project.create({
      title: 'API Documentation',
      description: 'Writing comprehensive API documentation for all microservices',
      status: 'completed',
      owner: admin._id,
    });

    console.log('Created projects');

    // Create tasks
    await Task.insertMany([
      {
        title: 'Setup project repository',
        description: 'Initialize Git repo and setup CI/CD pipeline',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2025-07-01'),
        project: project1._id,
        assignedTo: admin._id,
      },
      {
        title: 'Design database schema',
        description: 'Create ER diagrams and define database models',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2025-07-15'),
        project: project1._id,
        assignedTo: member._id,
      },
      {
        title: 'Implement authentication',
        description: 'Setup JWT-based authentication with refresh tokens',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-08-01'),
        project: project1._id,
        assignedTo: admin._id,
      },
      {
        title: 'Build product catalog API',
        description: 'CRUD endpoints for products with search and filtering',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-08-15'),
        project: project1._id,
      },
      {
        title: 'Payment gateway integration',
        description: 'Integrate Stripe for payment processing',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-09-01'),
        project: project1._id,
        assignedTo: member._id,
      },
      {
        title: 'User research',
        description: 'Conduct user interviews and analyze feedback',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2025-06-15'),
        project: project2._id,
        assignedTo: member._id,
      },
      {
        title: 'Create wireframes',
        description: 'Design wireframes for all major screens',
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2025-07-01'),
        project: project2._id,
        assignedTo: member._id,
      },
      {
        title: 'High-fidelity mockups',
        description: 'Create detailed UI mockups based on wireframes',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date('2025-07-20'),
        project: project2._id,
      },
      {
        title: 'Write API endpoints documentation',
        description: 'Document all REST API endpoints with examples',
        status: 'done',
        priority: 'high',
        dueDate: new Date('2025-06-01'),
        project: project3._id,
        assignedTo: admin._id,
      },
      {
        title: 'Review and finalize docs',
        description: 'Peer review all documentation and fix issues',
        status: 'done',
        priority: 'low',
        dueDate: new Date('2025-06-15'),
        project: project3._id,
        assignedTo: member._id,
      },
    ]);

    console.log('Created tasks');
    console.log('\nSeed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Member: john@example.com / password123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
