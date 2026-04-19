import { SiteContent, Project } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: '서울 패션위크 생중계',
    description: '2024 서울 패션위크의 현장감을 실시간으로 전달한 멀티캠 중계 프로젝트입니다.',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/live1/800/1200',
    media: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    equipment: 'Sony FX9, Blackmagic Constellation',
    category: '중계&음향'
  },
  {
    id: '2',
    title: '테슬라 브랜드 필름',
    description: '혁신과 지속 가능성을 강조한 테슬라 코리아의 브랜드 홍보 영상입니다.',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/video1/1200/800',
    media: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    equipment: 'ARRI Alexa Mini, Master Primes',
    category: '홍보영상'
  },
  {
    id: '3',
    title: '낙원 (Music Video)',
    description: '아티스트 "윤슬"의 신곡을 위한 몽환적이고 감각적인 뮤직비디오입니다.',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/mv1/1000/1500',
    media: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    equipment: 'RED V-RAPTOR, Cooke Anamorphic',
    category: '뮤직비디오'
  },
  {
    id: '4',
    title: '리그 오브 레전드 결승전 중계',
    description: 'e스포츠 대회의 열기를 생생하게 담아낸 대규모 생중계 작업물입니다.',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/live2/1200/800',
    media: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    equipment: 'EVS, Grass Valley Switcher',
    category: '중계&음향'
  },
  {
    id: '5',
    title: '삼성 갤럭시 런칭 필름',
    description: '새로운 모바일 경험을 제안하는 삼성 갤럭시 시리즈의 홍보 영상입니다.',
    type: 'video',
    thumbnail: 'https://picsum.photos/seed/promo1/1200/800',
    media: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ'
    ],
    equipment: 'RED V-RAPTOR',
    category: '홍보영상'
  },
  {
    id: '6',
    title: '기업 연말 파티',
    description: '활기찬 분위기의 기업 연말 파티 현장 스냅입니다.',
    type: 'photography',
    thumbnail: 'https://picsum.photos/seed/event1/800/800',
    media: ['https://picsum.photos/seed/event1/1600/1600'],
    category: '행사사진'
  },
  {
    id: '7',
    title: '신제품 런칭 쇼케이스',
    description: '브랜드의 정체성이 돋보이는 쇼케이스 현장 기록입니다.',
    type: 'photography',
    thumbnail: 'https://picsum.photos/seed/event2/800/800',
    media: ['https://picsum.photos/seed/event2/1600/1600'],
    category: '행사사진'
  },
  {
    id: '8',
    title: '아트 페어 오프닝',
    description: '예술적인 감성이 가득한 전시 오프닝 현장입니다.',
    type: 'photography',
    thumbnail: 'https://picsum.photos/seed/event3/800/800',
    media: ['https://picsum.photos/seed/event3/1600/1600'],
    category: '행사사진'
  },
  {
    id: '9',
    title: '컨퍼런스 메인 세션',
    description: '집중도 높은 컨퍼런스의 주요 순간을 포착했습니다.',
    type: 'photography',
    thumbnail: 'https://picsum.photos/seed/event4/800/800',
    media: ['https://picsum.photos/seed/event4/1600/1600'],
    category: '행사사진'
  },
  {
    id: '10',
    title: '야외 페스티벌 리허설',
    description: '자유로운 분위기의 페스티벌 현장 비하인드 씬입니다.',
    type: 'photography',
    thumbnail: 'https://picsum.photos/seed/event5/800/800',
    media: ['https://picsum.photos/seed/event5/1600/1600'],
    category: '행사사진'
  }
];

export const INITIAL_CONTENT: SiteContent = {
  about: {
    name: 'yuhyeon JEONG',
    description: '디지털 아티스트 & 비주얼 스토리텔러',
    bio: '저는 정지된 이미지와 움직이는 영상 모두를 통해 찰나의 본질을 포착하는 창작자입니다. 단순함 속에서 아름다움을 찾고, 침묵 속에서도 울림이 있는 이야기를 전하는 데 집중합니다. 서울을 기반으로 전 세계를 무대로 활동하고 있습니다.',
    email: 'yuhyeon@example.com',
    avatar: 'https://picsum.photos/seed/artist/400/400',
  },
  socialLinks: [
    { platform: 'INSTAGRAM', url: 'https://instagram.com' },
    { platform: 'YOUTUBE', url: 'https://youtube.com' }
  ],
  categories: [
    { id: '중계&음향', ko: '중계&음향', en: 'LIVE PRODUCTION', img: 'https://picsum.photos/seed/broadcast/1200/800' },
    { id: '홍보영상', ko: '홍보영상', en: 'PROMOTIONAL VIDEO', img: 'https://picsum.photos/seed/fresh-vibrant/1200/800' },
    { id: '뮤직비디오', ko: '뮤직비디오', en: 'MUSIC VIDEO', img: 'https://picsum.photos/seed/musicvideo/1200/800' },
    { id: '행사사진', ko: '행사사진', en: 'EVENT PHOTOGRAPHY', img: 'https://picsum.photos/seed/event/1200/800' },
  ]
};

