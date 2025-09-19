// data/questions.ts
export const baselineQuestions = [
  {
    section: 'Verbal Ability',
    questions: [
      {
        id: 'v1',
        hardness: 'medium',
        content: [
          { type: 'text', value: `Are we alone? The question has tickled the human imagination for years, perhaps ever since our earliest ancestors looked up at the night sky into the endless sea of stars. Is anyone else out there? Humans do not yet have a definitive answer to the question, but a team of astronomers running computer simulations of planet formation has found that Earth-like planets with enough water to support life could be fairly common.` },
        ],
        subQuestions: [
          {
            id: 'v1-1',
            hardness: 'easy',
            content: [{ type: 'text', value: 'From the passage, we can conclude that there is ________ possibility of life on any planet other than Earth:' }],
            options: ['No', 'Very low', 'Very high', 'Cannot be determined'],
            type: 'mcq',
          },
          {
            id: 'v1-2',
            hardness: 'medium',
            content: [{ type: 'text', value: 'Icarus is a/an:' }],
            options: ['Astrology journal', 'Weekly magazine', 'Aircraft', 'Astronomy journal'],
            type: 'mcq',
          },
          {
            id: 'v1-3',
            hardness: 'hard',
            content: [{ type: 'text', value: 'The simulations conducted showed all of the following results EXCEPT:' }],
            options: [
              'Each simulation produced one to four Earth-like planets.',
              'Earth-like planets may be quite common',
              'Earth-like planet formation occurred in about 25% of the cases',
              'Earth-like planet formation of a much larger size with hydrogen seas instead of water.'
            ],
            type: 'mcq',
          },
          // Add more subquestions v1-4, v1-5 similarly
        ],
      },
      {
        id: 'v2',
        hardness: 'easy',
        content: [{ type: 'text', value: 'Choose the option which will correctly fill the blank.' }],
        subQuestions: [
          {
            id: 'v2-1',
            hardness: 'easy',
            content: [{ type: 'text', value: 'The speech was filled _______ examples.' }],
            options: ['From', 'Of', 'With', 'In'],
            type: 'mcq',
          },
          // Add v2-2, v2-3, v2-4 similarly
        ],
      },
      // Add other verbal ability questions
    ],
  },
  {
    section: 'Analytical & Numerical Ability',
    questions: [
      {
        id: 'a1',
        hardness: 'medium',
        content: [],
        subQuestions: [
          {
            id: 'a1-1',
            hardness: 'hard',
            content: [{ type: 'text', value: 'In August, a cricket team that played 120 matches won 20% of the games it played. After a continuous winning streak, this team raised its average to 52%. How many matches did the team win to attain this average?' }],
            options: ['40', '52', '68', '80'],
            type: 'mcq',
          },
          {
            id: 'a1-2',
            hardness: 'medium',
            content: [{ type: 'text', value: 'If 75% of a number is 90, what is the number?' }],
            options: ['100', '125', '120', '67.5'],
            type: 'mcq',
          },
          // Add more a1-3 ... etc
        ],
      },
      // Add more sections/questions as needed
    ],
  },
  {
    section: 'Learning Ability',
    questions: [
      {
        id: 'l1',
        hardness: 'easy',
        content: [
          { type: 'text', value: `RSS is a family of XML file formats for web-syndication used by news websites and weblogs. The abbreviation stands for one of the following standards: Rich Site Summary (RSS 0.91), RDF Site Summary (RSS 0.9, 1.0 and 1.1), Really Simple Syndication (RSS 2.0). RSS provides short descriptions of Web content together with links to the full versions of the content.` },
        ],
        subQuestions: [
          {
            id: 'l1-1',
            hardness: 'easy',
            content: [{ type: 'text', value: 'Which one of these is NOT a full form of RSS?' }],
            options: ['Rich Site Summary', 'RDF Site Summary', 'Rich Site Syndication', 'Really Simple Syndication'],
            type: 'mcq',
          },
          {
            id: 'l1-2',
            hardness: 'medium',
            content: [{ type: 'text', value: 'RSS provides:' }],
            options: [
              'Short descriptions of Web content.',
              'Short descriptions of Web content + links to full content.',
              'File formats for Web syndication for Web sites.',
              'All the options'
            ],
            type: 'mcq',
          },
          // Add more l1-3, l1-4, l1-5
        ],
      },
    ],
  },
];
