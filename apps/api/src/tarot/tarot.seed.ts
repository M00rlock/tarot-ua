import { TarotCard } from './tarot.types';

export const TAROT_SEED: TarotCard[] = [
  {
    id: 'the-fool',
    name: 'Дурень',
    arcana: 'major',
    keywords: ['новий старт', 'спонтанність', 'сміливість'],
    meaningUpright: 'Час зробити крок у невідоме та довіритися життю.',
    meaningReversed: 'Імпульсивність або страх нового блокує рух уперед.',
    image: '/cards/the-fool.svg'
  },
  {
    id: 'the-magician',
    name: 'Маг',
    arcana: 'major',
    keywords: ['фокус', 'воля', 'реалізація'],
    meaningUpright: 'Твої навички та концентрація допоможуть втілити задум.',
    meaningReversed: 'Розфокус або спроба контролювати все одразу.',
    image: '/cards/the-magician.svg'
  },
  {
    id: 'the-high-priestess',
    name: 'Верховна Жриця',
    arcana: 'major',
    keywords: ['інтуїція', 'тиша', 'внутрішнє знання'],
    meaningUpright: 'Відповідь уже всередині, прислухайся до себе.',
    meaningReversed: 'Ігнорування інтуїції або невисловлена правда.',
    image: '/cards/the-high-priestess.svg'
  },
  {
    id: 'the-empress',
    name: 'Імператриця',
    arcana: 'major',
    keywords: ['турбота', 'достаток', 'творчість'],
    meaningUpright: 'Плекаєш ідеї та стосунки, і вони дають плоди.',
    meaningReversed: 'Виснаження через надмірну віддачу іншим.',
    image: '/cards/the-empress.svg'
  },
  {
    id: 'the-emperor',
    name: 'Імператор',
    arcana: 'major',
    keywords: ['структура', 'лідерство', 'межі'],
    meaningUpright: 'Порядок і дисципліна дадуть стабільний результат.',
    meaningReversed: 'Жорсткий контроль або небажання домовлятися.',
    image: '/cards/the-emperor.svg'
  },
  {
    id: 'the-lovers',
    name: 'Закохані',
    arcana: 'major',
    keywords: ['вибір', 'цінності', 'партнерство'],
    meaningUpright: 'Приймай рішення в гармонії зі своїми цінностями.',
    meaningReversed: 'Невизначеність або конфлікт бажань і принципів.',
    image: '/cards/the-lovers.svg'
  },
  {
    id: 'the-chariot',
    name: 'Колісниця',
    arcana: 'major',
    keywords: ['рух', 'ціль', 'перемога'],
    meaningUpright: 'Сфокусована дія допоможе пройти через перешкоди.',
    meaningReversed: 'Втрачений напрямок або надмірний тиск на себе.',
    image: '/cards/the-chariot.svg'
  },
  {
    id: 'wheel-of-fortune',
    name: 'Колесо Фортуни',
    arcana: 'major',
    keywords: ['цикл', 'зміни', 'час'],
    meaningUpright: 'Період змін відкриває нові можливості.',
    meaningReversed: 'Тимчасова затримка, що вимагає гнучкості.',
    image: '/cards/wheel-of-fortune.svg'
  },
  {
    id: 'the-star',
    name: 'Зірка',
    arcana: 'major',
    keywords: ['надія', 'відновлення', 'ясність'],
    meaningUpright: 'Поступово повертаються віра в себе і натхнення.',
    meaningReversed: 'Сумніви та втома, але ресурс відновлення поруч.',
    image: '/cards/the-star.svg'
  },
  {
    id: 'the-world',
    name: 'Світ',
    arcana: 'major',
    keywords: ['завершення', 'цілісність', 'новий етап'],
    meaningUpright: 'Завершення важливого циклу та готовність до нового.',
    meaningReversed: 'Незакриті питання перед наступним кроком.',
    image: '/cards/the-world.svg'
  }
];
