interface Category {
  id: number;
  name: string;
  description: string;
}

export const categories: Category[] = [
  { id: 1, name: '질문/답변', description: '질문 및 답변 형태를 포함해서 정보 습득이 목적인 내용' },
  { id: 2, name: '학교생활', description: '수강신청, 동아리, 학사, 장학, 졸업, 행정 등 학교생활과 관련된 내용' },
  { id: 3, name: '수업', description: '교수님, 과제, 시험, 공부법 등 수업과 관련된 내용' },
  { id: 4, name: '캠퍼스', description: '학교 시설, 식당, 도서관, 기숙사, 편의시설 등 캠퍼스 생활 및 주변 상권과 관련된 내용' },
  { id: 5, name: '일상생활', description: '건강, 아르바이트, 자취, 군대 등 일상생활에 도움이 될 만한 정보를 담고 있는 내용' },
  { id: 6, name: '취미/여가', description: '운동, 게임, 영화, 음악, 여행, 요리 등 취미 및 여가와 관련된 내용' },
  { id: 7, name: '인간관계', description: '친구, 선후배, 연애, 성격 등 인간관계와 관련된 내용' },
  { id: 8, name: '취업/진로', description: '인턴, 대외활동, 채용, 면접, 자격증, 대학원 등 취업 및 진로와 관련된 내용' },
];
