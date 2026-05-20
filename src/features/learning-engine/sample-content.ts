import type { LearningBlock, TopicNode } from "@/types/learning";
import { generatedCourses } from "./generated-courses";

export type CampusDepartment = {
  slug: string;
  code: string;
  name: string;
  kind: "UG" | "PG" | "Science" | "Humanities";
  sourceLabel: string;
  sourceHref: string;
};

export type CampusCourse = {
  slug: string;
  title: string;
  code: string;
  semester: number;
  progress: number;
  xp: number;
  departmentSlugs: string[];
  sourceLabel: string;
  sourceHref: string;
  modules: Array<{
    slug: string;
    title: string;
    progress: number;
    summary: string;
    realWorldUse: string;
    topics: TopicNode[];
  }>;
};

export const departments: CampusDepartment[] = [
  {
    slug: "aiml",
    code: "AI&ML",
    name: "Artificial Intelligence and Machine Learning",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/artificial-intelligence-and-machine-learning",
  },
  {
    slug: "cse",
    code: "CSE",
    name: "Computer Science and Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/computer-science-and-engineering",
  },
  {
    slug: "csbs",
    code: "CSBS",
    name: "Computer Science and Business Systems",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/computer-science-and-business-systems",
  },
  {
    slug: "ise",
    code: "ISE",
    name: "Information Science and Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Autonomous Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
  },
  {
    slug: "ece",
    code: "ECE",
    name: "Electronics and Communication Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/electronics-and-communication-engineering",
  },
  {
    slug: "ete",
    code: "ETE",
    name: "Electronics and Telecommunication Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Autonomous Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
  },
  {
    slug: "eee",
    code: "EEE",
    name: "Electrical and Electronics Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/electrical-and-electronics-engineering",
  },
  {
    slug: "civil",
    code: "CIVIL",
    name: "Civil Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/civil-engineering",
  },
  {
    slug: "mech",
    code: "MECH",
    name: "Mechanical Engineering",
    kind: "UG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/mechanical-engineering",
  },
  {
    slug: "mca",
    code: "MCA",
    name: "Master of Computer Applications",
    kind: "PG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/master-of-computer-applications",
  },
  {
    slug: "mba",
    code: "MBA",
    name: "Master of Business Administration",
    kind: "PG",
    sourceLabel: "BMSIT Departments",
    sourceHref: "https://bmsit.ac.in/master-of-business-administration",
  },
];

export const dbmsRoadmap: TopicNode[] = [
  { slug: "keys", title: "Keys", status: "complete", xp: 80 },
  { slug: "1nf", title: "1NF", status: "active", xp: 90 },
  { slug: "2nf", title: "2NF", status: "locked", xp: 110 },
  { slug: "3nf", title: "3NF", status: "locked", xp: 120 },
  { slug: "transactions", title: "Transactions", status: "locked", xp: 150 },
];

export const topicBlocks: LearningBlock[] = [
  {
    id: "b1",
    type: "text",
    title: "Why Normalization Exists",
    body:
      "Normalization is not a checklist. It is a way to remove update anomalies by making every fact live in one clear place.",
    callout: "Concept target: spot repeating groups before memorizing normal forms.",
  },
  {
    id: "b2",
    type: "diagram",
    title: "From Messy Table to Atomic Rows",
    nodes: ["Student + Courses", "Split repeated courses", "One row per fact", "Ready for 1NF"],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    id: "b3",
    type: "animation",
    title: "Repeating Group Collapse",
    frames: ["A row stores DBMS, OS, CN together", "Courses split into separate rows", "Each cell becomes atomic"],
  },
  {
    id: "b4",
    type: "quiz",
    question: "Which table violates 1NF?",
    options: [
      "Student(id, name, course)",
      "Student(id, name, courses: [DBMS, OS])",
      "Enrollment(student_id, course_id)",
      "Course(id, title)",
    ],
    answer: 1,
    explanation: "A list inside a cell is a repeating group. 1NF requires atomic values.",
  },
  {
    id: "b5",
    type: "flashcard",
    front: "1NF in one sentence",
    back: "Every column contains atomic values, and there are no repeating groups.",
  },
  {
    id: "b6",
    type: "step",
    title: "Convert a Table to 1NF",
    steps: ["Find multi-valued cells", "Create one row per value", "Preserve a key", "Check every cell is atomic"],
  },
  {
    id: "b7",
    type: "code",
    language: "sql",
    caption: "A clean Enrollment relation after removing repeated course values.",
    code: "CREATE TABLE enrollment (\n  student_id INT,\n  course_id INT,\n  PRIMARY KEY (student_id, course_id)\n);",
  },
  {
    id: "b8",
    type: "pyq",
    university: "VTU",
    year: "2023",
    question: "Explain 1NF with an example and convert an unnormalized table into 1NF.",
  },
];

export const courses: CampusCourse[] = [
  {
    slug: "dbms",
    title: "Database Management Systems",
    code: "BCS403",
    semester: 4,
    progress: 42,
    xp: 680,
    departmentSlugs: departments.map((department) => department.slug),
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "normalization",
        title: "Normalization",
        progress: 35,
        summary: "Build a mental model for schema design, anomalies, keys, and normal forms.",
        realWorldUse: "Used when designing transactional systems, ERP tables, academic portals, and normalized analytics stores.",
        topics: dbmsRoadmap,
      },
      {
        slug: "transactions",
        title: "Transactions and Concurrency",
        progress: 12,
        summary: "Understand ACID behavior, schedules, locks, serializability, and recovery.",
        realWorldUse: "Used in payment systems, college fee portals, inventory updates, and multi-user applications.",
        topics: [
          { slug: "acid", title: "ACID", status: "locked", xp: 100 },
          { slug: "schedules", title: "Schedules", status: "locked", xp: 120 },
        ],
      },
    ],
  },
  {
    slug: "os",
    title: "Operating Systems",
    code: "CS302",
    semester: 3,
    progress: 28,
    xp: 440,
    departmentSlugs: ["cse", "ise", "aiml", "csbs", "mca"],
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "cpu-scheduling",
        title: "CPU Scheduling",
        progress: 28,
        summary: "Simulate how the CPU chooses work and compare scheduling tradeoffs.",
        realWorldUse: "Used in kernels, cloud runtimes, containers, batch systems, and embedded devices.",
        topics: [
          { slug: "fcfs", title: "FCFS", status: "complete", xp: 70 },
          { slug: "sjf", title: "SJF", status: "active", xp: 90 },
          { slug: "round-robin", title: "Round Robin", status: "locked", xp: 120 },
        ],
      },
    ],
  },
  {
    slug: "data-structures",
    title: "Data Structures and Applications",
    code: "BCS304",
    semester: 4,
    progress: 36,
    xp: 520,
    departmentSlugs: departments.map((department) => department.slug),
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "linear-structures",
        title: "Linear Structures",
        progress: 40,
        summary: "Turn arrays, stacks, queues, and linked lists into predictable problem-solving tools.",
        realWorldUse: "Used in editors, compilers, browser history, job queues, and memory management.",
        topics: [
          { slug: "arrays", title: "Arrays", status: "complete", xp: 70 },
          { slug: "stacks", title: "Stacks", status: "active", xp: 80 },
          { slug: "queues", title: "Queues", status: "locked", xp: 80 },
        ],
      },
      {
        slug: "trees-graphs",
        title: "Trees and Graphs",
        progress: 14,
        summary: "Represent hierarchy and networks with traversals, shortest paths, and search.",
        realWorldUse: "Used in file systems, routing, recommendation systems, and dependency planners.",
        topics: [
          { slug: "trees", title: "Trees", status: "locked", xp: 100 },
          { slug: "graphs", title: "Graphs", status: "locked", xp: 120 },
        ],
      },
    ],
  },
  {
    slug: "cpp-programming",
    title: "C++ Programming",
    code: "BCS405",
    semester: 4,
    progress: 22,
    xp: 420,
    departmentSlugs: departments.map((department) => department.slug),
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "cpp-foundations",
        title: "C++ Foundations",
        progress: 24,
        summary: "Build programs with classes, objects, functions, memory, and standard library patterns.",
        realWorldUse: "Used in systems programming, competitive programming, embedded applications, and performance-critical software.",
        topics: [
          { slug: "classes-objects", title: "Classes and Objects", status: "active", xp: 80 },
          { slug: "constructors", title: "Constructors", status: "locked", xp: 80 },
          { slug: "inheritance", title: "Inheritance", status: "locked", xp: 100 },
        ],
      },
    ],
  },
  {
    slug: "universal-human-values",
    title: "Universal Human Values",
    code: "BUHK408",
    semester: 4,
    progress: 18,
    xp: 300,
    departmentSlugs: departments.map((department) => department.slug),
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "human-values",
        title: "Human Values",
        progress: 20,
        summary: "Reflect on self, family, society, professional ethics, and responsible engineering practice.",
        realWorldUse: "Used in teamwork, workplace decisions, leadership, sustainability, and ethical technology choices.",
        topics: [
          { slug: "self-exploration", title: "Self Exploration", status: "active", xp: 60 },
          { slug: "relationships", title: "Relationships", status: "locked", xp: 70 },
          { slug: "professional-ethics", title: "Professional Ethics", status: "locked", xp: 90 },
        ],
      },
    ],
  },
  {
    slug: "microcontrollers",
    title: "Microcontrollers",
    code: "BEC405",
    semester: 4,
    progress: 16,
    xp: 430,
    departmentSlugs: departments.map((department) => department.slug),
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "embedded-basics",
        title: "Embedded Basics",
        progress: 18,
        summary: "Understand microcontroller architecture, IO ports, timers, interrupts, and embedded C workflows.",
        realWorldUse: "Used in IoT devices, robotics, automotive controllers, instrumentation, and smart appliances.",
        topics: [
          { slug: "architecture", title: "Architecture", status: "active", xp: 80 },
          { slug: "interrupts", title: "Interrupts", status: "locked", xp: 90 },
          { slug: "timers", title: "Timers", status: "locked", xp: 90 },
        ],
      },
    ],
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    code: "AI401",
    semester: 4,
    progress: 18,
    xp: 460,
    departmentSlugs: ["aiml", "cse", "ise"],
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "supervised-learning",
        title: "Supervised Learning",
        progress: 22,
        summary: "Train, evaluate, and reason about regression and classification models.",
        realWorldUse: "Used in placement prediction, fraud checks, recommender systems, and document classification.",
        topics: [
          { slug: "linear-regression", title: "Linear Regression", status: "active", xp: 90 },
          { slug: "classification", title: "Classification", status: "locked", xp: 110 },
        ],
      },
    ],
  },
  {
    slug: "signals-systems",
    title: "Signals and Systems",
    code: "EC203",
    semester: 3,
    progress: 24,
    xp: 410,
    departmentSlugs: ["ece", "eee"],
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "signal-analysis",
        title: "Signal Analysis",
        progress: 24,
        summary: "Read continuous and discrete signals through transforms and system response.",
        realWorldUse: "Used in communications, audio processing, filters, sensors, and control systems.",
        topics: [
          { slug: "fourier-series", title: "Fourier Series", status: "active", xp: 100 },
          { slug: "laplace", title: "Laplace Transform", status: "locked", xp: 110 },
        ],
      },
    ],
  },
  {
    slug: "strength-of-materials",
    title: "Strength of Materials",
    code: "ME204",
    semester: 3,
    progress: 20,
    xp: 390,
    departmentSlugs: ["mech", "civil"],
    sourceLabel: "BMSIT Autonomous Scheme and Syllabus",
    sourceHref: "https://bmsit.ac.in/autonomous.php",
    modules: [
      {
        slug: "stress-strain",
        title: "Stress and Strain",
        progress: 20,
        summary: "Reason about material behavior under loads using diagrams and equations.",
        realWorldUse: "Used in bridges, machine parts, beams, shafts, and safety-critical structures.",
        topics: [
          { slug: "normal-stress", title: "Normal Stress", status: "active", xp: 80 },
          { slug: "bending", title: "Bending", status: "locked", xp: 110 },
        ],
      },
    ],
  },
  ...generatedCourses,
];

export function getDepartment(slug: string) {
  return departments.find((department) => department.slug === slug);
}

export function getCoursesForDepartment(slug: string) {
  return courses.filter((course) => course.departmentSlugs.includes(slug));
}

export function getSemesters() {
  return Array.from(new Set(courses.map((course) => course.semester))).sort((a, b) => a - b);
}

export function getCoursesForSemester(semester: number) {
  return courses.filter((course) => course.semester === semester);
}

export function getCoursesForSemesterAndDepartment(semester: number, departmentSlug: string) {
  return courses.filter((course) => course.semester === semester && course.departmentSlugs.includes(departmentSlug));
}
