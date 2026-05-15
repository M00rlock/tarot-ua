import { TarotCard } from './tarot.types';

export const TAROT_SEED: TarotCard[] = [
  // Старші Аркани (0-21)
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
    id: 'the-hierophant',
    name: 'Ієрофант',
    arcana: 'major',
    keywords: ['традиція', 'вчення', 'духовність'],
    meaningUpright: 'Дотримуйся перевірених принципів і знань.',
    meaningReversed: 'Опір до змін або сліпе слідування правилам.',
    image: '/cards/the-hierophant.svg'
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
    id: 'strength',
    name: 'Сила',
    arcana: 'major',
    keywords: ['мужність', 'стійкість', 'терпіння'],
    meaningUpright: 'Внутрішня сила допомагає подолати складнощі з грацією.',
    meaningReversed: 'Слабкість або невміння постояти за себе.',
    image: '/cards/strength.svg'
  },
  {
    id: 'the-hermit',
    name: 'Відлюдник',
    arcana: 'major',
    keywords: ['самотність', 'пошук', 'мудрість'],
    meaningUpright: 'Час для рефлексії і пошуку внутрішньої правди.',
    meaningReversed: 'Ізоляція або втеча від проблем.',
    image: '/cards/the-hermit.svg'
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
    id: 'justice',
    name: 'Справедливість',
    arcana: 'major',
    keywords: ['баланс', 'вибір', 'правда'],
    meaningUpright: 'Справедливе рішення чи наслідки своїх дій.',
    meaningReversed: 'Несправедливість або упередженість у судженні.',
    image: '/cards/justice.svg'
  },
  {
    id: 'the-hanged-man',
    name: 'Повішений',
    arcana: 'major',
    keywords: ['переглядання', 'відпущення', 'жертва'],
    meaningUpright: 'Потрібна нова перспектива для вирішення проблеми.',
    meaningReversed: 'Опір змінам або небажання переосмислити ситуацію.',
    image: '/cards/the-hanged-man.svg'
  },
  {
    id: 'death',
    name: 'Смерть',
    arcana: 'major',
    keywords: ['трансформація', 'кінець', 'нове начало'],
    meaningUpright: 'Завершення циклу і починання чогось нового.',
    meaningReversed: 'Опір до змін або застій.',
    image: '/cards/death.svg'
  },
  {
    id: 'temperance',
    name: 'Помірність',
    arcana: 'major',
    keywords: ['рівновага', 'гармонія', 'поміркованість'],
    meaningUpright: 'Знайти баланс між крайнощами.',
    meaningReversed: 'Дисбаланс або екстремізм.',
    image: '/cards/temperance.svg'
  },
  {
    id: 'the-devil',
    name: 'Чорт',
    arcana: 'major',
    keywords: ['матеріальність', 'залежність', 'забуття'],
    meaningUpright: 'Власні обмеження або залежність від матеріального.',
    meaningReversed: 'Визволення від психологічних ланцюгів.',
    image: '/cards/the-devil.svg'
  },
  {
    id: 'the-tower',
    name: 'Вежа',
    arcana: 'major',
    keywords: ['руйнування', 'звільнення', 'осяяння'],
    meaningUpright: 'Раптова зміна руйнує ілюзії.',
    meaningReversed: 'Уникнення кризи або затримка змін.',
    image: '/cards/the-tower.svg'
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
    id: 'the-moon',
    name: 'Місяць',
    arcana: 'major',
    keywords: ['ілюзія', 'несвідомість', 'страх'],
    meaningUpright: 'Довіряй власній інтуїції серед невизначеності.',
    meaningReversed: 'Ясність приходить при звільненні від страхів.',
    image: '/cards/the-moon.svg'
  },
  {
    id: 'the-sun',
    name: 'Сонце',
    arcana: 'major',
    keywords: ['радість', 'успіх', 'ясність'],
    meaningUpright: 'Період світла, успіху і позитивної енергії.',
    meaningReversed: 'Тимчасова затьмареність досягнень.',
    image: '/cards/the-sun.svg'
  },
  {
    id: 'judgement',
    name: 'Суд',
    arcana: 'major',
    keywords: ['пробудження', 'виклик', 'трансформація'],
    meaningUpright: 'Новий виклик вимагає переоцінки і дії.',
    meaningReversed: 'Відмова від прийняття нової реальності.',
    image: '/cards/judgement.svg'
  },
  {
    id: 'the-world',
    name: 'Світ',
    arcana: 'major',
    keywords: ['завершення', 'цілісність', 'новий етап'],
    meaningUpright: 'Завершення важливого циклу та готовність до нового.',
    meaningReversed: 'Незакриті питання перед наступним кроком.',
    image: '/cards/the-world.svg'
  },

  // Молодші Аркани - Палиці (Вогонь)
  {
    id: 'ace-of-wands',
    name: 'Туз Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['натхнення', 'новий проект', 'енергія'],
    meaningUpright: 'Творча енергія та нові можливості з\'являються.',
    meaningReversed: 'Втрачене натхнення або блокована енергія.',
    image: '/cards/ace-of-wands.svg'
  },
  {
    id: 'two-of-wands',
    name: 'Двійка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['планування', 'потенціал', 'рішення'],
    meaningUpright: 'Планування та підготовка до реалізації ідеї.',
    meaningReversed: 'Нерішучість або невдалі плани.',
    image: '/cards/two-of-wands.svg'
  },
  {
    id: 'three-of-wands',
    name: 'Трійка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['розширення', 'дальні подорожі', 'перспектива'],
    meaningUpright: 'Готовність до розширення горизонтів.',
    meaningReversed: 'Обмеженість або страх розширення.',
    image: '/cards/three-of-wands.svg'
  },
  {
    id: 'four-of-wands',
    name: 'Четвірка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['святкування', 'стабільність', 'гармонія'],
    meaningUpright: 'Радість і святкування досягнутого.',
    meaningReversed: 'Напруженість або дисгармонія у святкуванні.',
    image: '/cards/four-of-wands.svg'
  },
  {
    id: 'five-of-wands',
    name: 'П\'ятірка Жезл',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['конфлікт', 'змагання', 'випробування'],
    meaningUpright: 'Внутрішні або зовнішні конфлікти.',
    meaningReversed: 'Вирішення конфлікту або досягнення компромісу.',
    image: '/cards/five-of-wands.svg'
  },
  {
    id: 'six-of-wands',
    name: 'Шістка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['визнання', 'успіх', 'влада'],
    meaningUpright: 'Визнання та слава за гарну роботу.',
    meaningReversed: 'Втрата престижу або невдача.',
    image: '/cards/six-of-wands.svg'
  },
  {
    id: 'seven-of-wands',
    name: 'Сімка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['виклик', 'захист', 'опір'],
    meaningUpright: 'Потрібно постояти за свою позицію.',
    meaningReversed: 'Відступ або втеча від виклику.',
    image: '/cards/seven-of-wands.svg'
  },
  {
    id: 'eight-of-wands',
    name: 'Вісімка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['швидкість', 'комунікація', 'дія'],
    meaningUpright: 'Швидкі розвитки та активна комунікація.',
    meaningReversed: 'Затримка або гальмування процесів.',
    image: '/cards/eight-of-wands.svg'
  },
  {
    id: 'nine-of-wands',
    name: 'Дев\'ятка Жезл',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['витривалість', 'наполегливість', 'близько'],
    meaningUpright: 'Ти на межі перемоги, але потрібне останнє зусилля.',
    meaningReversed: 'Виснаження або відсутність наполегливості.',
    image: '/cards/nine-of-wands.svg'
  },
  {
    id: 'ten-of-wands',
    name: 'Десятка Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['обтяження', 'навантаження', 'завдання'],
    meaningUpright: 'Перевантаження відповідальністю.',
    meaningReversed: 'Звільнення від обтяжень.',
    image: '/cards/ten-of-wands.svg'
  },
  {
    id: 'page-of-wands',
    name: 'Паж Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['молодість', 'енергія', 'кур\'єр'],
    meaningUpright: 'Молодий дух і новини від енергійної особи.',
    meaningReversed: 'Лінивість або затримка повідомлень.',
    image: '/cards/page-of-wands.svg'
  },
  {
    id: 'knight-of-wands',
    name: 'Лицар Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['авантюра', 'пристрасть', 'подорож'],
    meaningUpright: 'Авантюристична енергія та пристрасна дія.',
    meaningReversed: 'Імпульсивність або неконтрольована агресія.',
    image: '/cards/knight-of-wands.svg'
  },
  {
    id: 'queen-of-wands',
    name: 'Королева Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['харизма', 'незалежність', 'впевненість'],
    meaningUpright: 'Впевнена і харизматична жінка.',
    meaningReversed: 'Агресія або запеклість.',
    image: '/cards/queen-of-wands.svg'
  },
  {
    id: 'king-of-wands',
    name: 'Король Жезлів',
    arcana: 'minor',
    suit: 'Жезли',
    keywords: ['лідерство', 'ентузіазм', 'влада'],
    meaningUpright: 'Лідер із пристрастю та енергією.',
    meaningReversed: 'Диктаторство або вибухова агресія.',
    image: '/cards/king-of-wands.svg'
  },

  // Молодші Аркани - Чаші (Вода)
  {
    id: 'ace-of-cups',
    name: 'Туз Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['любов', 'новий початок', 'емоція'],
    meaningUpright: 'Нові емоційні можливості та любов.',
    meaningReversed: 'Емоційна блокада або розчарування.',
    image: '/cards/ace-of-cups.svg'
  },
  {
    id: 'two-of-cups',
    name: 'Двійка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['партнерство', 'союз', 'гармонія'],
    meaningUpright: 'Глибоке партнерство та взаємна любов.',
    meaningReversed: 'Розрив або конфлікт у стосунках.',
    image: '/cards/two-of-cups.svg'
  },
  {
    id: 'three-of-cups',
    name: 'Трійка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['святкування', 'дружба', 'радість'],
    meaningUpright: 'Святкування з друзями та радість спільного.',
    meaningReversed: 'Самотність або суперечки серед друзів.',
    image: '/cards/three-of-cups.svg'
  },
  {
    id: 'four-of-cups',
    name: 'Четвірка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['апатія', 'медитація', 'розмірковування'],
    meaningUpright: 'Час для рефлексії, але можуть пропустити нову любов.',
    meaningReversed: 'Прийняття нової можливості, вихід з апатії.',
    image: '/cards/four-of-cups.svg'
  },
  {
    id: 'five-of-cups',
    name: 'П\'ятірка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['смуток', 'втрата', 'горе'],
    meaningUpright: 'Період смутку та горя.',
    meaningReversed: 'Зцілення та покращення емоційного стану.',
    image: '/cards/five-of-cups.svg'
  },
  {
    id: 'six-of-cups',
    name: 'Шістка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['дитинство', 'невинність', 'хороші спогади'],
    meaningUpright: 'Позитивні спогади та повернення простоти.',
    meaningReversed: 'Застряглість у минулому.',
    image: '/cards/six-of-cups.svg'
  },
  {
    id: 'seven-of-cups',
    name: 'Сімка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['ілюзія', 'вибір', 'спокуса'],
    meaningUpright: 'Багато варіантів, але не всі реальні.',
    meaningReversed: 'Ясність вибору та розуміння реальності.',
    image: '/cards/seven-of-cups.svg'
  },
  {
    id: 'eight-of-cups',
    name: 'Вісімка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['відпущення', 'пошук', 'бідність'],
    meaningUpright: 'Час відпустити минуле і шукати нову дорогу.',
    meaningReversed: 'Страх змін або невміння відпустити.',
    image: '/cards/eight-of-cups.svg'
  },
  {
    id: 'nine-of-cups',
    name: 'Дев\'ятка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['бажання', 'задоволення', 'успіх'],
    meaningUpright: 'Здійснення бажань та емоційна задоволеність.',
    meaningReversed: 'Невдоволення або занепокоєння.',
    image: '/cards/nine-of-cups.svg'
  },
  {
    id: 'ten-of-cups',
    name: 'Десятка Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['сімʼя', 'гармонія', 'благословення'],
    meaningUpright: 'Сімейна гармонія та благословення.',
    meaningReversed: 'Дисгармонія у сім\'ї або розвал.',
    image: '/cards/ten-of-cups.svg'
  },
  {
    id: 'page-of-cups',
    name: 'Паж Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['молода любов', 'креативність', 'вісті'],
    meaningUpright: 'Молоде кохання або творчі вісті.',
    meaningReversed: 'Замкненість або затримані вісті.',
    image: '/cards/page-of-cups.svg'
  },
  {
    id: 'knight-of-cups',
    name: 'Лицар Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['романтика', 'мрії', 'ідеалізм'],
    meaningUpright: 'Романтичний і чуттєвий лицар.',
    meaningReversed: 'Нестабільна емоційність або самообман.',
    image: '/cards/knight-of-cups.svg'
  },
  {
    id: 'queen-of-cups',
    name: 'Королева Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['співчуття', 'інтуїція', 'спокій'],
    meaningUpright: 'Емпатична та інтуїтивна жінка.',
    meaningReversed: 'Емоційна нестійкість або маніпуляція.',
    image: '/cards/queen-of-cups.svg'
  },
  {
    id: 'king-of-cups',
    name: 'Король Чаш',
    arcana: 'minor',
    suit: 'Чаші',
    keywords: ['дипломатія', 'емоційний контроль', 'мудрість'],
    meaningUpright: 'Емоційно урівноважений i дипломатичний лідер.',
    meaningReversed: 'Емоційна нестійкість або ненадійність.',
    image: '/cards/king-of-cups.svg'
  },

  // Молодші Аркани - Мечі (Повітря)
  {
    id: 'ace-of-swords',
    name: 'Туз Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['істина', 'ясність', 'нова ідея'],
    meaningUpright: 'Нова ідея та осяяння щодо істини.',
    meaningReversed: 'Плутанина або заплутані думки.',
    image: '/cards/ace-of-swords.svg'
  },
  {
    id: 'two-of-swords',
    name: 'Двійка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['невизначеність', 'дилема', 'затримка'],
    meaningUpright: 'Складний вибір між двома шляхами.',
    meaningReversed: 'Рішення приймається або розуміння з\'являється.',
    image: '/cards/two-of-swords.svg'
  },
  {
    id: 'three-of-swords',
    name: 'Трійка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['біль', 'розлука', 'страждання'],
    meaningUpright: 'Період болю та смутку.',
    meaningReversed: 'Починається зцілення болю.',
    image: '/cards/three-of-swords.svg'
  },
  {
    id: 'four-of-swords',
    name: 'Четвірка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['відпочинок', 'умиротворення', 'відновлення'],
    meaningUpright: 'Час для спокою та відновлення.',
    meaningReversed: 'Неспокій або невміння відпочити.',
    image: '/cards/four-of-swords.svg'
  },
  {
    id: 'five-of-swords',
    name: 'П\'ятірка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['конфлікт', 'поразка', 'розбіжності'],
    meaningUpright: 'Конфлікт з можливою поразкою.',
    meaningReversed: 'Примирення або припинення конфлікту.',
    image: '/cards/five-of-swords.svg'
  },
  {
    id: 'six-of-swords',
    name: 'Шістка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['подорож', 'рух', 'освіта'],
    meaningUpright: 'Подорож до кращого місця або переселення.',
    meaningReversed: 'Затримка подорожі або застій.',
    image: '/cards/six-of-swords.svg'
  },
  {
    id: 'seven-of-swords',
    name: 'Сімка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['хитрість', 'обман', 'крадіжка'],
    meaningUpright: 'Нечесна гра або прихована правда.',
    meaningReversed: 'Розкриття обману та повернення до честі.',
    image: '/cards/seven-of-swords.svg'
  },
  {
    id: 'eight-of-swords',
    name: 'Вісімка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['обмеження', 'пастка', 'страх'],
    meaningUpright: 'Почування пастки, але вихід можливий.',
    meaningReversed: 'Звільнення від обмежень.',
    image: '/cards/eight-of-swords.svg'
  },
  {
    id: 'nine-of-swords',
    name: 'Дев\'ятка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['жах', 'депресія', 'нічна тривога'],
    meaningUpright: 'Нічні жахи та психологічна тривога.',
    meaningReversed: 'Послаблення страхів та тривог.',
    image: '/cards/nine-of-swords.svg'
  },
  {
    id: 'ten-of-swords',
    name: 'Десятка Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['катастрофа', 'кінець', 'дно'],
    meaningUpright: 'Кінець важкого періоду та можливість відновлення.',
    meaningReversed: 'Все ще в скрутній ситуації.',
    image: '/cards/ten-of-swords.svg'
  },
  {
    id: 'page-of-swords',
    name: 'Паж Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['інтелект', 'кмітливість', 'юнак'],
    meaningUpright: 'Допитливий молодий розум.',
    meaningReversed: 'Хаотичні думки або погана комунікація.',
    image: '/cards/page-of-swords.svg'
  },
  {
    id: 'knight-of-swords',
    name: 'Лицар Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['логіка', 'інтелект', 'конфліктність'],
    meaningUpright: 'Логічний і аналітичний лицар.',
    meaningReversed: 'Аргументативність або жорсткість.',
    image: '/cards/knight-of-swords.svg'
  },
  {
    id: 'queen-of-swords',
    name: 'Королева Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['інтелект', 'ясність меж', 'самостійність'],
    meaningUpright: 'Розумна та спостережлива жінка.',
    meaningReversed: 'Жорстокість чи холодність у судженнях.',
    image: '/cards/queen-of-swords.svg'
  },
  {
    id: 'king-of-swords',
    name: 'Король Мечей',
    arcana: 'minor',
    suit: 'Мечі',
    keywords: ['влада', 'справедливість', 'вирок'],
    meaningUpright: 'Авторитетний і справедливий лідер.',
    meaningReversed: 'Диктаторство або несправедливі судження.',
    image: '/cards/king-of-swords.svg'
  },

  // Молодші Аркани - Пентаклі (Земля)
  {
    id: 'ace-of-pentacles',
    name: 'Туз Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['матеріальне благо', 'успіх', 'нові можливості'],
    meaningUpright: 'Нова матеріальна можливість або успіх.',
    meaningReversed: 'Втрачена можливість або фінансові труднощі.',
    image: '/cards/ace-of-pentacles.svg'
  },
  {
    id: 'two-of-pentacles',
    name: 'Двійка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['баланс', 'жонглювання', 'адаптивність'],
    meaningUpright: 'Балансування між роботою та задоволенням.',
    meaningReversed: 'Дисбаланс або збій у плануванні.',
    image: '/cards/two-of-pentacles.svg'
  },
  {
    id: 'three-of-pentacles',
    name: 'Трійка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['робота', 'навичка', 'командна робота'],
    meaningUpright: 'Спільна робота та визнання майстерності.',
    meaningReversed: 'Неякісна робота або конфлікти в команді.',
    image: '/cards/three-of-pentacles.svg'
  },
  {
    id: 'four-of-pentacles',
    name: 'Четвірка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['утримання', 'захист', 'жадібність'],
    meaningUpright: 'Утримання та страх втратити матеріальне.',
    meaningReversed: 'Відпускання контролю та щедрість.',
    image: '/cards/four-of-pentacles.svg'
  },
  {
    id: 'five-of-pentacles',
    name: 'П\'ятірка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['бідність', 'турбота', 'позбавлення'],
    meaningUpright: 'Період матеріальних труднощів та тривог.',
    meaningReversed: 'Відновлення після матеріальних труднощів.',
    image: '/cards/five-of-pentacles.svg'
  },
  {
    id: 'six-of-pentacles',
    name: 'Шістка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['щедрість', 'поділ', 'справедливість'],
    meaningUpright: 'Щедрість та справедливий поділ благ.',
    meaningReversed: 'Недостатність або нечесна гра.',
    image: '/cards/six-of-pentacles.svg'
  },
  {
    id: 'seven-of-pentacles',
    name: 'Сімка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['інвестиція', 'вирощування', 'терпіння'],
    meaningUpright: 'Терпляче інвестуй час у розвиток.',
    meaningReversed: 'Втрачена інвестиція або недостатня праця.',
    image: '/cards/seven-of-pentacles.svg'
  },
  {
    id: 'eight-of-pentacles',
    name: 'Вісімка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['навичка', 'ремесло', 'вкладання'],
    meaningUpright: 'Напрацювання навичок та вдосконалення майстерності.',
    meaningReversed: 'Лінь або недостатня підготовка.',
    image: '/cards/eight-of-pentacles.svg'
  },
  {
    id: 'nine-of-pentacles',
    name: 'Дев\'ятка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['достаток', 'матеріальне благо', 'самостійність'],
    meaningUpright: 'Достаток та матеріальний успіх від своїх зусиль.',
    meaningReversed: 'Втрата достатку або залежність.',
    image: '/cards/nine-of-pentacles.svg'
  },
  {
    id: 'ten-of-pentacles',
    name: 'Десятка Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['спадок', 'покоління', 'благословення'],
    meaningUpright: 'Матеріальне благословення та сімейний спадок.',
    meaningReversed: 'Втрата спадку або сімейні конфлікти.',
    image: '/cards/ten-of-pentacles.svg'
  },
  {
    id: 'page-of-pentacles',
    name: 'Паж Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['учень', 'розвиток', 'практичність'],
    meaningUpright: 'Амбітний молодик, який навчається.',
    meaningReversed: 'Неуважність або небажання вчитися.',
    image: '/cards/page-of-pentacles.svg'
  },
  {
    id: 'knight-of-pentacles',
    name: 'Лицар Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['послідовність', 'надійність', 'сум\'язність'],
    meaningUpright: 'Надійний та наполегливий робітник.',
    meaningReversed: 'Скупість або застрягання в рутині.',
    image: '/cards/knight-of-pentacles.svg'
  },
  {
    id: 'queen-of-pentacles',
    name: 'Королева Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['практичність', 'дбайлива', 'матеріальна'],
    meaningUpright: 'Практична та дбайлива жінка.',
    meaningReversed: 'Невпевненість або матеріальна залежність.',
    image: '/cards/queen-of-pentacles.svg'
  },
  {
    id: 'king-of-pentacles',
    name: 'Король Пентаклей',
    arcana: 'minor',
    suit: 'Пентаклі',
    keywords: ['багатство', 'успіх', 'лідерство'],
    meaningUpright: 'Успішний та матеріально заможний лідер.',
    meaningReversed: 'Жадібність або втрата матеріальної стабільності.',
    image: '/cards/king-of-pentacles.svg'
  }
];