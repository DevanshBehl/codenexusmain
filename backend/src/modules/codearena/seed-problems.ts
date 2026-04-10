import { prisma } from '../../lib/prisma.js';

const DSA_PROBLEMS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "EASY",
    tags: ["Array", "Hash Table"],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    is_published: true,
    testCases: [
      { input: "[2,7,11,15]\n9", expected_output: "[0,1]", is_sample: true },
      { input: "[3,2,4]\n6", expected_output: "[1,2]", is_sample: true },
      { input: "[3,3]\n6", expected_output: "[0,1]", is_sample: false },
    ]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "MEDIUM",
    tags: ["Hash Table", "String", "Sliding Window"],
    constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
    is_published: true,
    testCases: [
      { input: '"abcabcbb"', expected_output: "3", is_sample: true },
      { input: '"bbbbb"', expected_output: "1", is_sample: true },
      { input: '"pwwkew"', expected_output: "3", is_sample: false },
    ]
  },
  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "HARD",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    constraints: "nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000",
    is_published: true,
    testCases: [
      { input: "[1,3]\n[2]", expected_output: "2.00000", is_sample: true },
      { input: "[1,2]\n[3,4]", expected_output: "2.50000", is_sample: true },
    ]
  },
  {
    title: "Merge K Sorted Lists",
    slug: "merge-k-sorted-lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "HARD",
    tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    constraints: "k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500\n-10^4 <= lists[i][j] <= 10^4",
    is_published: true,
    testCases: [
      { input: "[[1,4,5],[1,3,4],[2,6]]", expected_output: "[1,1,2,3,4,4,5,6]", is_sample: true },
      { input: "[]", expected_output: "[]", is_sample: true },
    ]
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "EASY",
    tags: ["String", "Stack"],
    constraints: "1 <= s.length <= 10^4\n s consists of parentheses only '()[]{}'.",
    is_published: true,
    testCases: [
      { input: '"()"', expected_output: "true", is_sample: true },
      { input: '"()[]{}"', expected_output: "true", is_sample: true },
      { input: '"(]"', expected_output: "false", is_sample: false },
    ]
  },
  // Adding just a few more items for variety
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "EASY",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    constraints: "1 <= n <= 45",
    is_published: true,
    testCases: [
      { input: "2", expected_output: "2", is_sample: true },
      { input: "3", expected_output: "3", is_sample: true },
    ]
  },
  {
    title: "Search in Rotated Sorted Array",
    slug: "search-in-rotated-sorted-array",
    description: "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated.",
    difficulty: "MEDIUM",
    tags: ["Array", "Binary Search"],
    constraints: "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4",
    is_published: true,
    testCases: [
      { input: "[4,5,6,7,0,1,2]\n0", expected_output: "4", is_sample: true },
      { input: "[4,5,6,7,0,1,2]\n3", expected_output: "-1", is_sample: true },
    ]
  }
];

async function seed() {
  console.log("Seeding CodeArena Problems...");

  for (const prob of DSA_PROBLEMS) {
    const existing = await prisma.caProblem.findUnique({
      where: { slug: prob.slug }
    });

    if (!existing) {
      await prisma.caProblem.create({
        data: {
          title: prob.title,
          slug: prob.slug,
          description: prob.description,
          difficulty: prob.difficulty,
          tags: prob.tags,
          constraints: prob.constraints,
          is_published: prob.is_published,
          testCases: {
            create: prob.testCases.map((tc, idx) => ({
              input: tc.input,
              expected_output: tc.expected_output,
              is_sample: tc.is_sample,
              order_index: idx
            }))
          }
        }
      });
      console.log(`+ Created problem: ${prob.title}`);
    } else {
      console.log(`- Problem already exists: ${prob.title}`);
    }
  }

  console.log("CodeArena Database seeding completed.");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
