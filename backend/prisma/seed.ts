import { Role } from '../src/generated/prisma/client.js';
import { prisma } from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Clearing old data...');

  // Delete all records in reverse logical order to avoid foreign key constraints
  await prisma.mailPermissionViolation.deleteMany();
  await prisma.mail.deleteMany();
  await prisma.webinarTargetUniversity.deleteMany();
  await prisma.webinar.deleteMany();
  await prisma.recording.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.contest.deleteMany();
  await prisma.project.deleteMany();
  await prisma.companyUniversity.deleteMany();
  await prisma.student.deleteMany();
  await prisma.recruiter.deleteMany();
  await prisma.company.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();

  console.log('Old data cleared.');
  console.log('Seeding new data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create University User
  const uniUser = await prisma.user.create({
    data: {
      email: 'admin@stanford.edu',
      password: passwordHash,
      role: Role.UNIVERSITY,
      cnid: 'CN-UNI-123456',
      universityProfile: {
        create: {
          name: 'Stanford University',
          location: 'Stanford, CA',
          tier: 1,
          status: 'ACTIVE',
        },
      },
    },
    include: { universityProfile: true },
  });

  const uniId = uniUser.universityProfile!.id;

  // 2. Create Company Admin User
  const compUser = await prisma.user.create({
    data: {
      email: 'admin@google.com',
      password: passwordHash,
      role: Role.COMPANY_ADMIN,
      cnid: 'CN-CMP-654321',
      companyProfile: {
        create: {
          name: 'Google',
          description: 'A tech giant.',
          industry: 'Technology',
        },
      },
    },
    include: { companyProfile: true },
  });

  const compId = compUser.companyProfile!.id;

  // 3. Create Company-University Partnership
  await prisma.companyUniversity.create({
    data: {
      companyId: compId,
      universityId: uniId,
    },
  });

  // 4. Create Recruiter User
  const recUser = await prisma.user.create({
    data: {
      email: 'recruiter@google.com',
      password: passwordHash,
      role: Role.RECRUITER,
      cnid: 'CN-REC-111111',
      recruiterProfile: {
        create: {
          companyId: compId,
          name: 'John Recruiter',
        },
      },
    },
    include: { recruiterProfile: true },
  });

  const recId = recUser.recruiterProfile!.id;

  // 5. Create Students
  const student1User = await prisma.user.create({
    data: {
      email: 'student1@stanford.edu',
      password: passwordHash,
      role: Role.STUDENT,
      cnid: 'CN-STU-123123',
      studentProfile: {
        create: {
          universityId: uniId,
          name: 'Alice Student',
          branch: 'Computer Science',
          cgpa: 9.5,
          status: 'AVAILABLE',
        },
      },
    },
    include: { studentProfile: true },
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'student2@stanford.edu',
      password: passwordHash,
      role: Role.STUDENT,
      cnid: 'CN-STU-321321',
      studentProfile: {
        create: {
          universityId: uniId,
          name: 'Bob Student',
          branch: 'Electrical Engineering',
          cgpa: 8.8,
          status: 'AVAILABLE',
        },
      },
    },
    include: { studentProfile: true },
  });

  const s1Id = student1User.studentProfile!.id;
  const s2Id = student2User.studentProfile!.id;

  // 6. Create Job Applications
  await prisma.jobApplication.create({
    data: {
      studentId: s1Id,
      companyId: compId,
      status: 'SHORTLISTED',
    },
  });

  // 7. Create a Project
  await prisma.project.create({
    data: {
      studentId: s1Id,
      title: 'AI Chatbot',
      description: 'A chatbot powered by LLMs.',
      techStack: 'Python, React',
      githubLink: 'https://github.com/alice/chatbot',
    },
  });

  // 8. Create a Contest, Problem, TestCase, Submission
  const contest = await prisma.contest.create({
    data: {
      companyId: compId,
      title: 'Google Hiring Challenge 2026',
      description: 'Annual competitive programming contest.',
      date: new Date(),
      durationMins: 120,
      languages: ['C++', 'Java', 'Python', 'JavaScript'],
      status: 'ACTIVE',
    },
  });

  const problem = await prisma.problem.create({
    data: {
      contestId: contest.id,
      title: 'Two Sum',
      description: 'Find two numbers that add up to a target.',
      difficulty: 'EASY',
      topic: 'Arrays',
      points: 100,
    },
  });

  await prisma.testCase.createMany({
    data: [
      { problemId: problem.id, input: '[2,7,11,15]\n9', output: '[0,1]' },
      { problemId: problem.id, input: '[3,2,4]\n6', output: '[1,2]', isHidden: true },
    ],
  });

  await prisma.submission.create({
    data: {
      studentId: s1Id,
      problemId: problem.id,
      code: 'return [0, 1];',
      language: 'JavaScript',
      passed: 2,
      total: 2,
      status: 'AC',
    },
  });

  // 9. Create Interview & Recording
  const interview = await prisma.interview.create({
    data: {
      recruiterId: recId,
      studentId: s1Id,
      role: 'SDE I',
      scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
      type: 'TECHNICAL',
      status: 'SCHEDULED',
    },
  });

  await prisma.recording.create({
    data: {
      interviewId: interview.id,
      videoUrl: 'https://example.com/recording.mp4',
      durationStr: '45 mins',
      rating: 4.5,
      verdict: 'PENDING',
    },
  });

  // 10. Create Webinar & Target University mapping
  const webinar = await prisma.webinar.create({
    data: {
      companyId: compId,
      title: 'Life at Google',
      agenda: 'Discussing the culture and opportunities at Google.',
      scheduledAt: new Date(Date.now() + 86400000 * 2),
      durationMins: 60,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'UPCOMING',
    },
  });

  await prisma.webinarTargetUniversity.create({
    data: {
      webinarId: webinar.id,
      universityId: uniId,
    },
  });

  // 11. Create Mails
  const threadId = '11111111-2222-3333-4444-555555555555';
  await prisma.mail.create({
    data: {
      sender_cnid: uniUser.cnid!,
      recipient_cnid: student1User.cnid!,
      subject: 'Welcome to Stanford!',
      body: 'Welcome to the university portal. Let us know if you have any questions.',
      thread_id: threadId,
      is_read: false,
    },
  });

  await prisma.mail.create({
    data: {
      sender_cnid: recUser.cnid!,
      recipient_cnid: student1User.cnid!,
      subject: 'Interview Scheduled',
      body: 'Your technical interview has been scheduled for tomorrow.',
      thread_id: '11111111-2222-3333-4444-666666666666',
      is_read: true,
    },
  });

  // 12. Create Mail Permission Violation
  await prisma.mailPermissionViolation.create({
    data: {
      sender_cnid: student1User.cnid!,
      attempted_recipient_cnid: compUser.cnid!,
      action: 'Student attempting to mail Company Admin directly',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
