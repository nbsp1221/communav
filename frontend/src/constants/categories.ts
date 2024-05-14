export interface Category {
  id: number;
  name: string;
  description: string;
  isDeprecated?: boolean;
}

export const CATEGORIES: Category[] = [
  {
    id: 0,
    name: '자유',
    description: '어느 카테고리에도 속하지 않는 자유로운 주제의 내용',
  },
  {
    id: 1,
    name: '학사',
    description: '수강신청, 학점, 전공, 학사 관리 및 문제, 자퇴, 졸업, 학사 일정, 재수강 등',
  },
  {
    id: 2,
    name: '장학 · 행정',
    description: '등록, 장학금, 학자금 대출, 증명서, 학생증, 휴학, 전과, 교환학생 등',
  },
  {
    id: 3,
    name: '학교생활',
    description: '동아리, 행사, 축제, 대회, 학생회, 경험 공유 등',
  },
  {
    id: 4,
    name: '수업',
    description: '교수님, 과제, 시험, 과목 추천, 수업 정보 등',
  },
  {
    id: 5,
    name: '수업/이과',
    description: '수업 카테고리 중 이과 수업과 관련된 내용',
  },
  {
    id: 6,
    name: '수업/문과',
    description: '수업 카테고리 중 문과 수업과 관련된 내용',
  },
  {
    id: 7,
    name: '캠퍼스',
    description: '학교 시설, 식당, 도서관, 기숙사, 편의시설, 주변 상권, 주변 교통 등',
  },
  {
    id: 8,
    name: '취업 · 진로',
    description: '인턴, 대외활동, 채용, 면접, 자격증, 대학원 등',
  },
  {
    id: 9,
    name: '일상생활',
    description: '건강, 아르바이트, 자취, 일상생활 팁 등',
  },
  {
    id: 10,
    name: '음식점 · 카페',
    description: '맛집, 카페, 술집, 배달, 관련 정보 및 리뷰 등',
  },
  {
    id: 11,
    name: '취미 · 여가',
    description: '운동, 게임, 영화, 음악, 여행, 요리 등',
  },
  {
    id: 12,
    name: '인간관계',
    description: '친구, 선후배, 연애, 성격, 사랑, 대인관계 등',
  },
  {
    id: 13,
    name: '병역',
    description: '육군, 해군, 공군, 입대, 군 생활, 전역, 대체 복무, 예비군 등',
  },
];
