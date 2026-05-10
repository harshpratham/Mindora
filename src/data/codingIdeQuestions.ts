export type IdeLanguage = 'java' | 'cpp' | 'c' | 'apex';

export type CodingIdeQuestion = {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  description: string;
  constraints: string[];
  examples: string[];
  hints: string[];
  starters: Record<IdeLanguage, string>;
};

function startersFor(title: string, tag: string): Record<IdeLanguage, string> {
  const safe = tag.replace(/"/g, "'");
  return {
    java: `// ${title}\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("${safe}");\n    // Write your solution here\n  }\n}\n`,
    cpp: `// ${title}\n#include <iostream>\n\nint main() {\n  std::cout << "${safe}" << std::endl;\n  // Write your solution here\n  return 0;\n}\n`,
    c: `// ${title}\n#include <stdio.h>\n\nint main(void) {\n  printf("${safe}\\n");\n  /* Write your solution here */\n  return 0;\n}\n`,
    apex: `// ${title} — Apex runs on Salesforce only (Run uses info message here)\n// Practice: System.debug('${safe}');\n`,
  };
}

const CORE: Omit<CodingIdeQuestion, 'id' | 'starters'>[] = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays, Hash Map',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution exists.',
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i], target ≤ 10⁹'],
    examples: ['Input: nums = [2,7,11,15], target = 9 → Output: [0,1]'],
    hints: ['Use a hash map from value to index while scanning the array'],
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list and return the new head.',
    constraints: ['0 ≤ n ≤ 5000'],
    examples: ['Input: 1→2→3→4→5 → Output: 5→4→3→2→1'],
    hints: ['Iterative: three pointers prev, curr, next'],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stack',
    description:
      'Given a string s containing just "(", ")", "{", "}", "[" and "]", determine if the input string is valid (correctly closed and ordered).',
    constraints: ['1 ≤ s.length ≤ 10⁴'],
    examples: ['Input: "()[]{}" → true', 'Input: "(]" → false'],
    hints: ['Use a stack; pop on closing bracket if top matches'],
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    topic: 'Linked List',
    description: 'Merge two sorted linked lists and return one sorted list.',
    constraints: ['Number of nodes in both lists ≤ 50'],
    examples: ['list1 = [1,2,4], list2 = [1,3,4] → [1,1,2,3,4,4]'],
    hints: ['Dummy head node simplifies pointer juggling'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Arrays',
    description: 'You are given prices where prices[i] is stock price on day i. Choose one buy and one sell day to maximize profit.',
    constraints: ['1 ≤ prices.length ≤ 10⁵'],
    examples: ['prices = [7,1,5,3,6,4] → profit 5'],
    hints: ['Track minimum price so far while scanning'],
  },
  {
    title: 'Binary Search',
    difficulty: 'Easy',
    topic: 'Binary Search',
    description: 'Given sorted nums and target, return index of target or -1 if absent.',
    constraints: ['1 ≤ nums.length ≤ 10⁴', 'nums sorted ascending'],
    examples: ['nums = [-1,0,3,5,9,12], target = 9 → 4'],
    hints: ['Classic two-pointer mid = (lo+hi)/2'],
  },
  {
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    description: 'Find the contiguous subarray with largest sum and return that sum.',
    constraints: ['1 ≤ nums.length ≤ 10⁵'],
    examples: ['nums = [-2,1,-3,4,-1,2,1,-5,4] → 6'],
    hints: ['Either extend current sum or restart at nums[i]'],
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    description: 'You can climb 1 or 2 steps each time. In how many distinct ways can you reach the top of n stairs?',
    constraints: ['1 ≤ n ≤ 45'],
    examples: ['n = 3 → 3 ways'],
    hints: ['Ways(n) = Ways(n-1) + Ways(n-2)'],
  },
  {
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    topic: 'Hash Set',
    description: 'Return true if any value appears at least twice in nums.',
    constraints: ['1 ≤ nums.length ≤ 10⁵'],
    examples: ['[1,2,3,1] → true', '[1,2,3,4] → false'],
    hints: ['HashSet insert; if add fails duplicate exists'],
  },
  {
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    topic: 'Tree',
    description: 'Given the root of a binary tree, invert the tree (swap every left and right child).',
    constraints: ['Number of nodes ≤ 100'],
    examples: ['Tree mirrors left/right recursively'],
    hints: ['DFS or BFS; swap children at each node'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    constraints: ['0 ≤ s.length ≤ 5×10⁴'],
    examples: ['"abcabcbb" → 3 ("abc")'],
    hints: ['Sliding window + map of last index'],
  },
  {
    title: '3Sum',
    difficulty: 'Medium',
    topic: 'Arrays, Two Pointers',
    description: 'Return all unique triplets [nums[i], nums[j], nums[k]] such that i≠j≠k and sum is zero.',
    constraints: ['3 ≤ nums.length ≤ 3000'],
    examples: ['nums = [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]'],
    hints: ['Sort; fix one index; two-pointer on remainder'],
  },
  {
    title: 'Container With Most Water',
    difficulty: 'Medium',
    topic: 'Two Pointers',
    description: 'Heights array; choose two lines to maximize water trapped between them.',
    constraints: ['2 ≤ height.length ≤ 10⁵'],
    examples: ['[1,8,6,2,5,4,8,3,7] → 49'],
    hints: ['Two pointers from ends; move shorter side'],
  },
  {
    title: 'Group Anagrams',
    difficulty: 'Medium',
    topic: 'Hash Map, Strings',
    description: 'Given an array of strings, group anagrams together (any order).',
    constraints: ['1 ≤ strs.length ≤ 10⁴', '0 ≤ strs[i].length ≤ 100'],
    examples: ['["eat","tea","tan","ate","nat","bat"] → grouped sets'],
    hints: ['Key = sorted letters or count signature'],
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    topic: 'Prefix Sum',
    description: 'Return array answer where answer[i] is product of all nums except nums[i], without division.',
    constraints: ['2 ≤ nums.length ≤ 10⁵'],
    examples: ['[1,2,3,4] → [24,12,8,6]'],
    hints: ['Left products × right products'],
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    topic: 'Graph, DFS/BFS',
    description: 'Given a 2D grid of land (1) and water (0), count islands (4-directionally connected land).',
    constraints: ['m,n ≤ 300'],
    examples: ['Grid with two separate land masses → 2'],
    hints: ['Flood fill DFS/BFS marking visited'],
  },
  {
    title: 'Course Schedule (Detect Cycle)',
    difficulty: 'Medium',
    topic: 'Graph, Topological Sort',
    description: 'Prerequisites as directed edges; determine if you can finish all courses (no cycle).',
    constraints: ['1 ≤ numCourses ≤ 10⁵'],
    examples: ['numCourses=2, prereq [[1,0]] → true'],
    hints: ['Kahn algorithm or DFS three-color'],
  },
  {
    title: 'Merge Intervals',
    difficulty: 'Medium',
    topic: 'Sorting',
    description: 'Given intervals [start,end], merge all overlapping intervals.',
    constraints: ['1 ≤ intervals.length ≤ 10⁴'],
    examples: ['[[1,3],[2,6],[8,10]] → [[1,6],[8,10]]'],
    hints: ['Sort by start; sweep merging'],
  },
  {
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topic: 'Strings, DP',
    description: 'Return the longest palindromic substring in s.',
    constraints: ['1 ≤ s.length ≤ 1000'],
    examples: ['"babad" → "bab" or "aba"'],
    hints: ['Expand around center for odd/even length'],
  },
  {
    title: 'Word Break',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    description: 'Given string s and dictionary of words, return true if s can be segmented into space-separated dictionary words.',
    constraints: ['1 ≤ s.length ≤ 300'],
    examples: ['s="leetcode", wordDict=["leet","code"] → true'],
    hints: ['DP[i] = can segment prefix of length i'],
  },
];

export const CODING_IDE_QUESTIONS: CodingIdeQuestion[] = CORE.map((q, i) => ({
  ...q,
  id: `cq-${i + 1}`,
  starters: startersFor(q.title, `Mindora #${i + 1}`),
}));

/** First 10 shown in sidebar; full bank has 20 + marketing line for 2000+ */
export const VISIBLE_QUESTION_COUNT = 10;
export const MORE_QUESTIONS_LABEL = '2000+';
