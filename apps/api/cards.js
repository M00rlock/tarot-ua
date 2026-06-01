const gremlin = require('gremlin');

const TAROT_SEED = [
  { id: 'the-fool', name: 'Дурень', arcana: 'major', keywords: ['новий старт', 'спонтанність', 'сміливість'], meaningUpright: 'Час зробити крок у невідоме та довіритися життю.', meaningReversed: 'Імпульсивність або страх нового блокує рух уперед.', image: '/cards/the-fool.svg' },
  { id: 'the-magician', name: 'Маг', arcana: 'major', keywords: ['фокус', 'воля', 'реалізація'], meaningUpright: 'Твої навички та концентрація допоможуть втілити задум.', meaningReversed: 'Розфокус або спроба контролювати все одразу.', image: '/cards/the-magician.svg' },
  { id: 'the-high-priestess', name: 'Верховна Жриця', arcana: 'major', keywords: ['інтуїція', 'тиша', 'внутрішнє знання'], meaningUpright: 'Відповідь уже всередині, прислухайся до себе.', meaningReversed: 'Ігнорування інтуїції або невисловлена правда.', image: '/cards/the-high-priestess.svg' },
  { id: 'the-empress', name: 'Імператриця', arcana: 'major', keywords: ['турбота', 'достаток', 'творчість'], meaningUpright: 'Плекаєш ідеї та стосунки, і вони дають плоди.', meaningReversed: 'Виснаження через надмірну віддачу іншим.', image: '/cards/the-empress.svg' },
  { id: 'the-emperor', name: 'Імператор', arcana: 'major', keywords: ['структура', 'лідерство', 'межі'], meaningUpright: 'Порядок і дисципліна дадуть стабільний результат.', meaningReversed: 'Жорсткий контроль або небажання домовлятися.', image: '/cards/the-emperor.svg' },
  { id: 'the-hierophant', name: 'Ієрофант', arcana: 'major', keywords: ['традиція', 'вчення', 'духовність'], meaningUpright: 'Дотримуйся перевірених принципів і знань.', meaningReversed: 'Опір до змін або сліпе слідування правилам.', image: '/cards/the-hierophant.svg' },
  { id: 'the-lovers', name: 'Закохані', arcana: 'major', keywords: ['вибір', 'цінності', 'партнерство'], meaningUpright: 'Приймай рішення в гармонії зі своїми цінностями.', meaningReversed: 'Невизначеність або конфлікт бажань і принципів.', image: '/cards/the-lovers.svg' },
  { id: 'the-chariot', name: 'Колісниця', arcana: 'major', keywords: ['рух', 'ціль', 'перемога'], meaningUpright: 'Сфокусована дія допоможе пройти через перешкоди.', meaningReversed: 'Втрачений напрямок або надмірний тиск на себе.', image: '/cards/the-chariot.svg' },
  { id: 'strength', name: 'Сила', arcana: 'major', keywords: ['мужність', 'стійкість', 'терпіння'], meaningUpright: 'Внутрішня сила допомагає подолати складнощі з грацією.', meaningReversed: 'Слабкість або невміння постояти за себе.', image: '/cards/strength.svg' },
  { id: 'the-hermit', name: 'Відлюдник', arcana: 'major', keywords: ['самотність', 'пошук', 'мудрість'], meaningUpright: 'Час для рефлексії і пошуку внутрішньої правди.', meaningReversed: 'Ізоляція або втеча від проблем.', image: '/cards/the-hermit.svg' },
  { id: 'wheel-of-fortune', name: 'Колесо Фортуни', arcana: 'major', keywords: ['цикл', 'зміни', 'час'], meaningUpright: 'Період змін відкриває нові можливості.', meaningReversed: 'Тимчасова затримка, що вимагає гнучкості.', image: '/cards/wheel-of-fortune.svg' },
  { id: 'justice', name: 'Справедливість', arcana: 'major', keywords: ['баланс', 'вибір', 'правда'], meaningUpright: 'Справедливе рішення чи наслідки своїх дій.', meaningReversed: 'Несправедливість або упередженість у судженні.', image: '/cards/justice.svg' },
  { id: 'the-hanged-man', name: 'Повішений', arcana: 'major', keywords: ['переглядання', 'відпущення', 'жертва'], meaningUpright: 'Потрібна нова перспектива для вирішення проблеми.', meaningReversed: 'Опір змінам або небажання переосмислити ситуацію.', image: '/cards/the-hanged-man.svg' },
  { id: 'death', name: 'Смерть', arcana: 'major', keywords: ['трансформація', 'кінець', 'нове начало'], meaningUpright: 'Завершення циклу і починання чогось нового.', meaningReversed: 'Опір до змін або застій.', image: '/cards/death.svg' },
  { id: 'temperance', name: 'Помірність', arcana: 'major', keywords: ['рівновага', 'гармонія', 'поміркованість'], meaningUpright: 'Знайти баланс між крайнощами.', meaningReversed: 'Дисбаланс або екстремізм.', image: '/cards/temperance.svg' },
  { id: 'the-devil', name: 'Чорт', arcana: 'major', keywords: ['матеріальність', 'залежність', 'забуття'], meaningUpright: 'Власні обмеження або залежність від матеріального.', meaningReversed: 'Визволення від психологічних ланцюгів.', image: '/cards/the-devil.svg' },
  { id: 'the-tower', name: 'Вежа', arcana: 'major', keywords: ['руйнування', 'звільнення', 'осяяння'], meaningUpright: 'Раптова зміна руйнує ілюзії.', meaningReversed: 'Уникнення кризи або затримка змін.', image: '/cards/the-tower.svg' },
  { id: 'the-star', name: 'Зірка', arcana: 'major', keywords: ['надія', 'відновлення', 'ясність'], meaningUpright: 'Поступово повертаються віра в себе і натхнення.', meaningReversed: 'Сумніви та втома, але ресурс відновлення поруч.', image: '/cards/the-star.svg' },
  { id: 'the-moon', name: 'Місяць', arcana: 'major', keywords: ['ілюзія', 'несвідомість', 'страх'], meaningUpright: 'Довіряй власній інтуїції серед невизначеності.', meaningReversed: 'Ясність приходить при звільненні від страхів.', image: '/cards/the-moon.svg' },
  { id: 'the-sun', name: 'Сонце', arcana: 'major', keywords: ['радість', 'успіх', 'ясність'], meaningUpright: 'Період світла, успіху і позитивної енергії.', meaningReversed: 'Тимчасова затьмареність досягнень.', image: '/cards/the-sun.svg' },
  { id: 'judgement', name: 'Суд', arcana: 'major', keywords: ['пробудження', 'виклик', 'трансформація'], meaningUpright: 'Новий виклик вимагає переоцінки і дії.', meaningReversed: 'Відмова від прийняття нової реальності.', image: '/cards/judgement.svg' },
  { id: 'the-world', name: 'Світ', arcana: 'major', keywords: ['завершення', 'цілісність', 'новий етап'], meaningUpright: 'Завершення важливого циклу та готовність до нового.', meaningReversed: 'Незакриті питання перед наступним кроком.', image: '/cards/the-world.svg' },
  { id: 'ace-of-wands', name: 'Туз Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['натхнення', 'новий проект', 'енергія'], meaningUpright: 'Творча енергія та нові можливості з\'являються.', meaningReversed: 'Втрачене натхнення або блокована енергія.', image: '/cards/ace-of-wands.svg' },
  { id: 'two-of-wands', name: 'Двійка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['планування', 'потенціал', 'рішення'], meaningUpright: 'Планування та підготовка до реалізації ідеї.', meaningReversed: 'Нерішучість або невдалі плани.', image: '/cards/two-of-wands.svg' },
  { id: 'three-of-wands', name: 'Трійка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['розширення', 'дальні подорожі', 'перспектива'], meaningUpright: 'Готовність до розширення горизонтів.', meaningReversed: 'Обмеженість або страх розширення.', image: '/cards/three-of-wands.svg' },
  { id: 'four-of-wands', name: 'Четвірка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['святкування', 'стабільність', 'гармонія'], meaningUpright: 'Радість і святкування досягнутого.', meaningReversed: 'Напруженість або дисгармонія у святкуванні.', image: '/cards/four-of-wands.svg' },
  { id: 'five-of-wands', name: 'П\'ятірка Жезл', arcana: 'minor', suit: 'Жезли', keywords: ['конфлікт', 'змагання', 'випробування'], meaningUpright: 'Внутрішні або зовнішні конфлікти.', meaningReversed: 'Вирішення конфлікту або досягнення компромісу.', image: '/cards/five-of-wands.svg' },
  { id: 'six-of-wands', name: 'Шістка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['визнання', 'успіх', 'влада'], meaningUpright: 'Визнання та слава за гарну роботу.', meaningReversed: 'Втрата престижу або невдача.', image: '/cards/six-of-wands.svg' },
  { id: 'seven-of-wands', name: 'Сімка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['виклик', 'захист', 'опір'], meaningUpright: 'Потрібно постояти за свою позицію.', meaningReversed: 'Відступ або втеча від виклику.', image: '/cards/seven-of-wands.svg' },
  { id: 'eight-of-wands', name: 'Вісімка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['швидкість', 'комунікація', 'дія'], meaningUpright: 'Швидкі розвитки та активна комунікація.', meaningReversed: 'Затримка або гальмування процесів.', image: '/cards/eight-of-wands.svg' },
  { id: 'nine-of-wands', name: 'Дев\'ятка Жезл', arcana: 'minor', suit: 'Жезли', keywords: ['витривалість', 'наполегливість', 'близько'], meaningUpright: 'Ти на межі перемоги, але потрібне останнє зусилля.', meaningReversed: 'Виснаження або відсутність наполегливості.', image: '/cards/nine-of-wands.svg' },
  { id: 'ten-of-wands', name: 'Десятка Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['обтяження', 'навантаження', 'завдання'], meaningUpright: 'Перевантаження відповідальністю.', meaningReversed: 'Звільнення від обтяжень.', image: '/cards/ten-of-wands.svg' },
  { id: 'page-of-wands', name: 'Паж Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['молодість', 'енергія', 'кур\'єр'], meaningUpright: 'Молодий дух і новини від енергійної особи.', meaningReversed: 'Лінивість або затримка повідомлень.', image: '/cards/page-of-wands.svg' },
  { id: 'knight-of-wands', name: 'Лицар Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['авантюра', 'пристрасть', 'подорож'], meaningUpright: 'Авантюристична енергія та пристрасна дія.', meaningReversed: 'Імпульсивність або неконтрольована агресія.', image: '/cards/knight-of-wands.svg' },
  { id: 'queen-of-wands', name: 'Королева Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['харизма', 'незалежність', 'впевненість'], meaningUpright: 'Впевнена і харизматична жінка.', meaningReversed: 'Агресія або запеклість.', image: '/cards/queen-of-wands.svg' },
  { id: 'king-of-wands', name: 'Король Жезлів', arcana: 'minor', suit: 'Жезли', keywords: ['лідерство', 'ентузіазм', 'влада'], meaningUpright: 'Лідер із пристрастю та енергією.', meaningReversed: 'Диктаторство або вибухова агресія.', image: '/cards/king-of-wands.svg' },
  { id: 'ace-of-cups', name: 'Туз Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['любов', 'новий початок', 'емоція'], meaningUpright: 'Нові емоційні можливості та любов.', meaningReversed: 'Емоційна блокада або розчарування.', image: '/cards/ace-of-cups.svg' },
  { id: 'two-of-cups', name: 'Двійка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['партнерство', 'союз', 'гармонія'], meaningUpright: 'Глибоке партнерство та взаємна любов.', meaningReversed: 'Розрив або конфлікт у стосунках.', image: '/cards/two-of-cups.svg' },
  { id: 'three-of-cups', name: 'Трійка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['святкування', 'дружба', 'радість'], meaningUpright: 'Святкування з друзями та радість спільного.', meaningReversed: 'Самотність або суперечки серед друзів.', image: '/cards/three-of-cups.svg' },
  { id: 'four-of-cups', name: 'Четвірка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['апатія', 'медитація', 'розмірковування'], meaningUpright: 'Час для рефлексії, але можуть пропустити нову любов.', meaningReversed: 'Прийняття нової можливості, вихід з апатії.', image: '/cards/four-of-cups.svg' },
  { id: 'five-of-cups', name: 'П\'ятірка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['смуток', 'втрата', 'горе'], meaningUpright: 'Період смутку та горя.', meaningReversed: 'Зцілення та покращення емоційного стану.', image: '/cards/five-of-cups.svg' },
  { id: 'six-of-cups', name: 'Шістка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['дитинство', 'невинність', 'хороші спогади'], meaningUpright: 'Позитивні спогади та повернення простоти.', meaningReversed: 'Застряглість у минулому.', image: '/cards/six-of-cups.svg' },
  { id: 'seven-of-cups', name: 'Сімка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['ілюзія', 'вибір', 'спокуса'], meaningUpright: 'Багато варіантів, але не всі реальні.', meaningReversed: 'Ясність вибору та розуміння реальності.', image: '/cards/seven-of-cups.svg' },
  { id: 'eight-of-cups', name: 'Вісімка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['відпущення', 'пошук', 'бідність'], meaningUpright: 'Час відпустити минуле і шукати нову дорогу.', meaningReversed: 'Страх змін або невміння відпустити.', image: '/cards/eight-of-cups.svg' },
  { id: 'nine-of-cups', name: 'Дев\'ятка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['бажання', 'задоволення', 'успіх'], meaningUpright: 'Здійснення бажань та емоційна задоволеність.', meaningReversed: 'Невдоволення або занепокоєння.', image: '/cards/nine-of-cups.svg' },
  { id: 'ten-of-cups', name: 'Десятка Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['сім\'я', 'гармонія', 'благословення'], meaningUpright: 'Сімейна гармонія та благословення.', meaningReversed: 'Дисгармонія у сім\'ї або розвал.', image: '/cards/ten-of-cups.svg' },
  { id: 'page-of-cups', name: 'Паж Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['молода любов', 'креативність', 'вісті'], meaningUpright: 'Молоде кохання або творчі вісті.', meaningReversed: 'Замкненість або затримані вісті.', image: '/cards/page-of-cups.svg' },
  { id: 'knight-of-cups', name: 'Лицар Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['романтика', 'мрії', 'ідеалізм'], meaningUpright: 'Романтичний і чуттєвий лицар.', meaningReversed: 'Нестабільна емоційність або самообман.', image: '/cards/knight-of-cups.svg' },
  { id: 'queen-of-cups', name: 'Королева Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['співчуття', 'інтуїція', 'спокій'], meaningUpright: 'Емпатична та інтуїтивна жінка.', meaningReversed: 'Емоційна нестійкість або маніпуляція.', image: '/cards/queen-of-cups.svg' },
  { id: 'king-of-cups', name: 'Король Чаш', arcana: 'minor', suit: 'Чаші', keywords: ['дипломатія', 'емоційний контроль', 'мудрість'], meaningUpright: 'Емоційно урівноважений i дипломатичний лідер.', meaningReversed: 'Емоційна нестійкість або ненадійність.', image: '/cards/king-of-cups.svg' },
  { id: 'ace-of-swords', name: 'Туз Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['істина', 'ясність', 'нова ідея'], meaningUpright: 'Нова ідея та осяяння щодо істини.', meaningReversed: 'Плутанина або заплутані думки.', image: '/cards/ace-of-swords.svg' },
  { id: 'two-of-swords', name: 'Двійка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['невизначеність', 'дилема', 'затримка'], meaningUpright: 'Складний вибір між двома шляхами.', meaningReversed: 'Рішення приймається або розуміння з\'являється.', image: '/cards/two-of-swords.svg' },
  { id: 'three-of-swords', name: 'Трійка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['біль', 'розлука', 'страждання'], meaningUpright: 'Період болю та смутку.', meaningReversed: 'Починається зцілення болю.', image: '/cards/three-of-swords.svg' },
  { id: 'four-of-swords', name: 'Четвірка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['відпочинок', 'умиротворення', 'відновлення'], meaningUpright: 'Час для спокою та відновлення.', meaningReversed: 'Неспокій або невміння відпочити.', image: '/cards/four-of-swords.svg' },
  { id: 'five-of-swords', name: 'П\'ятірка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['конфлікт', 'поразка', 'розбіжності'], meaningUpright: 'Конфлікт з можливою поразкою.', meaningReversed: 'Примирення або припинення конфлікту.', image: '/cards/five-of-swords.svg' },
  { id: 'six-of-swords', name: 'Шістка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['подорож', 'рух', 'освіта'], meaningUpright: 'Подорож до кращого місця або переселення.', meaningReversed: 'Затримка подорожі або застій.', image: '/cards/six-of-swords.svg' },
  { id: 'seven-of-swords', name: 'Сімка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['хитрість', 'обман', 'крадіжка'], meaningUpright: 'Нечесна гра або прихована правда.', meaningReversed: 'Розкриття обману та повернення до честі.', image: '/cards/seven-of-swords.svg' },
  { id: 'eight-of-swords', name: 'Вісімка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['обмеження', 'пастка', 'страх'], meaningUpright: 'Почування пастки, але вихід можливий.', meaningReversed: 'Звільнення від обмежень.', image: '/cards/eight-of-swords.svg' },
  { id: 'nine-of-swords', name: 'Дев\'ятка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['жах', 'депресія', 'нічна тривога'], meaningUpright: 'Нічні жахи та психологічна тривога.', meaningReversed: 'Послаблення страхів та тривог.', image: '/cards/nine-of-swords.svg' },
  { id: 'ten-of-swords', name: 'Десятка Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['катастрофа', 'кінець', 'дно'], meaningUpright: 'Кінець важкого періоду та можливість відновлення.', meaningReversed: 'Все ще в скрутній ситуації.', image: '/cards/ten-of-swords.svg' },
  { id: 'page-of-swords', name: 'Паж Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['інтелект', 'кмітливість', 'юнак'], meaningUpright: 'Допитливий молодий розум.', meaningReversed: 'Хаотичні думки або погана комунікація.', image: '/cards/page-of-swords.svg' },
  { id: 'knight-of-swords', name: 'Лицар Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['логіка', 'інтелект', 'конфліктність'], meaningUpright: 'Логічний і аналітичний лицар.', meaningReversed: 'Аргументативність або жорсткість.', image: '/cards/knight-of-swords.svg' },
  { id: 'queen-of-swords', name: 'Королева Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['інтелект', 'ясність меж', 'самостійність'], meaningUpright: 'Розумна та спостережлива жінка.', meaningReversed: 'Жорстокість чи холодність у судженнях.', image: '/cards/queen-of-swords.svg' },
  { id: 'king-of-swords', name: 'Король Мечей', arcana: 'minor', suit: 'Мечі', keywords: ['влада', 'справедливість', 'вирок'], meaningUpright: 'Авторитетний і справедливий лідер.', meaningReversed: 'Диктаторство або несправедливі судження.', image: '/cards/king-of-swords.svg' },
  { id: 'ace-of-pentacles', name: 'Туз Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['матеріальне благо', 'успіх', 'нові можливості'], meaningUpright: 'Нова матеріальна можливість або успіх.', meaningReversed: 'Втрачена можливість або фінансові труднощі.', image: '/cards/ace-of-pentacles.svg' },
  { id: 'two-of-pentacles', name: 'Двійка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['баланс', 'жонглювання', 'адаптивність'], meaningUpright: 'Балансування між роботою та задоволенням.', meaningReversed: 'Дисбаланс або збій у плануванні.', image: '/cards/two-of-pentacles.svg' },
  { id: 'three-of-pentacles', name: 'Трійка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['робота', 'навичка', 'командна робота'], meaningUpright: 'Спільна робота та визнання майстерності.', meaningReversed: 'Неякісна робота або конфлікти в команді.', image: '/cards/three-of-pentacles.svg' },
  { id: 'four-of-pentacles', name: 'Четвірка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['утримання', 'захист', 'жадібність'], meaningUpright: 'Утримання та страх втратити матеріальне.', meaningReversed: 'Відпускання контролю та щедрість.', image: '/cards/four-of-pentacles.svg' },
  { id: 'five-of-pentacles', name: 'П\'ятірка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['бідність', 'турбота', 'позбавлення'], meaningUpright: 'Період матеріальних труднощів та тривог.', meaningReversed: 'Відновлення після матеріальних труднощів.', image: '/cards/five-of-pentacles.svg' },
  { id: 'six-of-pentacles', name: 'Шістка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['щедрість', 'поділ', 'справедливість'], meaningUpright: 'Щедрість та справедливий поділ благ.', meaningReversed: 'Недостатність або нечесна гра.', image: '/cards/six-of-pentacles.svg' },
  { id: 'seven-of-pentacles', name: 'Сімка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['інвестиція', 'вирощування', 'терпіння'], meaningUpright: 'Терпляче інвестуй час у розвиток.', meaningReversed: 'Втрачена інвестиція або недостатня праця.', image: '/cards/seven-of-pentacles.svg' },
  { id: 'eight-of-pentacles', name: 'Вісімка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['навичка', 'ремесло', 'вкладання'], meaningUpright: 'Напрацювання навичок та вдосконалення майстерності.', meaningReversed: 'Лінь або недостатня підготовка.', image: '/cards/eight-of-pentacles.svg' },
  { id: 'nine-of-pentacles', name: 'Дев\'ятка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['достаток', 'матеріальне благо', 'самостійність'], meaningUpright: 'Достаток та матеріальний успіх від своїх зусиль.', meaningReversed: 'Втрата достатку або залежність.', image: '/cards/nine-of-pentacles.svg' },
  { id: 'ten-of-pentacles', name: 'Десятка Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['спадок', 'покоління', 'благословення'], meaningUpright: 'Матеріальне благословення та сімейний спадок.', meaningReversed: 'Втрата спадку або сімейні конфлікти.', image: '/cards/ten-of-pentacles.svg' },
  { id: 'page-of-pentacles', name: 'Паж Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['учень', 'розвиток', 'практичність'], meaningUpright: 'Амбітний молодик, який навчається.', meaningReversed: 'Неуважність або небажання вчитися.', image: '/cards/page-of-pentacles.svg' },
  { id: 'knight-of-pentacles', name: 'Лицар Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['послідовність', 'надійність', 'сум\'язність'], meaningUpright: 'Надійний та наполегливий робітник.', meaningReversed: 'Скупість або застрягання в рутині.', image: '/cards/knight-of-pentacles.svg' },
  { id: 'queen-of-pentacles', name: 'Королева Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['практичність', 'дбайлива', 'матеріальна'], meaningUpright: 'Практична та дбайлива жінка.', meaningReversed: 'Невпевненість або матеріальна залежність.', image: '/cards/queen-of-pentacles.svg' },
  { id: 'king-of-pentacles', name: 'Король Пентаклей', arcana: 'minor', suit: 'Пентаклі', keywords: ['багатство', 'успіх', 'лідерство'], meaningUpright: 'Успішний та матеріально заможний лідер.', meaningReversed: 'Жадібність або втрата матеріальної стабільності.', image: '/cards/king-of-pentacles.svg' },
];

const SPREAD_DEFINITIONS = [
  { id: 'classic3', title: 'Минуле · Теперішнє · Майбутнє', count: 3, positions: [{ name: 'Минуле', description: 'Що вже вплинуло на ситуацію або створило поточний фон.' }, { name: 'Теперішнє', description: 'Що відбувається зараз і потребує найбільшої уваги.' }, { name: 'Майбутнє', description: 'Найімовірніший напрям розвитку, якщо нічого не змінювати.' }] },
  { id: 'pentagram5', title: 'Пентаграма балансу', count: 5, positions: [{ name: 'Дух', description: 'Головний сенс ситуації та внутрішній вектор.' }, { name: 'Вогонь / дія', description: 'Що варто зробити активно й сміливо.' }, { name: 'Земля / результат', description: 'Практичний результат або матеріальний прояв.' }, { name: 'Вода / емоції', description: 'Почуття, інтуїція та приховані переживання.' }, { name: 'Повітря / думки', description: 'Ідеї, логіка, комунікація й ментальні блоки.' }] },
  { id: 'love5', title: 'Кохання та стосунки', count: 5, positions: [{ name: 'Я', description: 'Твоя позиція, потреби й внутрішній стан у стосунках.' }, { name: 'Партнер / Інша сторона', description: 'Стан і мотиви другої людини або потенційного партнера.' }, { name: 'Зв\'язок', description: 'Що реально тримає вас разом або створює тяжіння.' }, { name: 'Перешкода', description: 'Що заважає близькості, довірі або ясності.' }, { name: 'Порада', description: 'Найкращий наступний крок для серця й здорових меж.' }] },
  { id: 'career5', title: 'Кар\'єра та гроші', count: 5, positions: [{ name: 'Поточна роль', description: 'Де ти зараз у професійному або фінансовому питанні.' }, { name: 'Сильна сторона', description: 'На що варто спертися, щоб рухатися швидше.' }, { name: 'Ризик', description: 'Що може забирати ресурс або створити помилку.' }, { name: 'Можливість', description: 'Де є потенціал росту, грошей або нового напрямку.' }, { name: 'Наступний крок', description: 'Конкретний фокус для дії найближчим часом.' }] },
];

function createGremlinClient() {
  const endpoint = process.env.JANUSGRAPH_ENDPOINT || 'ws://localhost:8182/gremlin';
  try {
    const { driver } = gremlin;
    return new driver.Client(endpoint, { traversalSource: 'g', mimeType: 'application/vnd.gremlin-v3.0+json' });
  } catch {
    return null;
  }
}

async function getCards(limit) {
  const client = createGremlinClient();
  if (!client) return TAROT_SEED.slice(0, limit || 78);

  try {
    const result = await client.submit(
      `g.V().hasLabel("card").limit(${limit || 78})
       .project("id","name","arcana","keywords","meaningUpright","meaningReversed","image")
        .by(values("cardId")).by(values("name")).by(values("arcana"))
        .by(values("keywords")).by(values("meaningUpright")).by(values("meaningReversed")).by(values("image"))`
    );
    const rows = result.toArray();
    if (rows.length === 0) return TAROT_SEED.slice(0, limit || 78);

    return rows.map((row, index) => {
      const getFirst = (key) => {
        const val = row.get(key);
        return Array.isArray(val) ? val[0] : val;
      };
      const seedFallbackId = TAROT_SEED[index % TAROT_SEED.length].id;
      return {
        id: String(getFirst('id') || seedFallbackId),
        name: String(getFirst('name') || 'Невідома карта'),
        arcana: getFirst('arcana') || 'major',
        keywords: normalizeKeywords(row.get('keywords')),
        meaningUpright: String(getFirst('meaningUpright') || ''),
        meaningReversed: String(getFirst('meaningReversed') || ''),
        image: String(getFirst('image') || `/cards/${seedFallbackId}.svg`),
      };
    });
  } catch {
    return TAROT_SEED.slice(0, limit || 78);
  }
}

async function seedGremlinIfNeeded() {
  const client = createGremlinClient();
  if (!client) return;

  try {
    const check = await client.submit('g.V().hasLabel("card").count()');
    const count = Number(check.first());
    if (count > 0) return;

    for (const card of TAROT_SEED) {
      await client.submit(
        'g.addV("card").property("cardId", cardId).property("name", name).property("arcana", arcana).property("keywords", keywords).property("meaningUpright", upright).property("meaningReversed", reversed).property("image", image)',
        { cardId: card.id, name: card.name, arcana: card.arcana, keywords: card.keywords.join(', '), upright: card.meaningUpright, reversed: card.meaningReversed, image: card.image }
      );
    }
  } catch {
    // JanusGraph not available
  }
}

function normalizeKeywords(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => String(item).split(',')).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function resolveSpread(count, spreadType) {
  if (spreadType) {
    const byType = SPREAD_DEFINITIONS.find((s) => s.id === spreadType);
    if (byType) return byType;
  }
  const exact = SPREAD_DEFINITIONS.find((s) => s.count === count);
  if (exact) return exact;
  return count >= 5 ? SPREAD_DEFINITIONS.find((s) => s.id === 'pentagram5') || SPREAD_DEFINITIONS[0] : SPREAD_DEFINITIONS[0];
}

function toDayKey(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hash(value) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

function meaning(item) {
  return item.reversed ? item.card.meaningReversed : item.card.meaningUpright;
}

function buildSummary(spread, title, tone, majorCount, reversedCount, dominantSuit) {
  const first = spread[0];
  const last = spread[spread.length - 1];
  const firstMeaning = meaning(first);
  const lastMeaning = meaning(last);
  const arcanaPhrase = majorCount >= Math.ceil(spread.length / 2)
    ? 'Розклад має сильний архетипний заряд: тут ідеться не лише про події, а про зміну внутрішньої ролі.'
    : 'Розклад більше говорить про практичні кроки, звички й рішення, ніж про різкий зовнішній поворот.';
  const reversedPhrase = reversedCount > 0
    ? ` ${reversedCount} перевернут${reversedCount === 1 ? 'а карта показує' : 'і карти показують'}, де енергія зараз заблокована або потребує чеснішого погляду.`
    : ' Усі карти відкриті прямо, тому енергія читається як доволі ясна й доступна для дії.';

  if (tone === 'mystic') {
    return `${title} відкривається через карту «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Фінальний акцент — «${last.card.name}», і він веде до теми: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Домінує енергія «${dominantSuit}», тож саме вона задає атмосферу розкладу.`;
  }
  if (tone === 'practical') {
    return `Головна тема розкладу — «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Результуючий вектор показує «${last.card.name}»: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Практичний фокус зараз — сфера «${dominantSuit}».`;
  }
  return `Цей розклад показує внутрішній процес, який починається з «${first.card.name}» у позиції «${first.position}»: ${firstMeaning} Далі він поступово приводить до «${last.card.name}»: ${lastMeaning} ${arcanaPhrase}${reversedPhrase} Найбільше психологічне навантаження зараз несе тема «${dominantSuit}».`;
}

function buildEnergyLine(majorCount, reversedCount, uprightCount, dominantSuit) {
  const balance = reversedCount > uprightCount
    ? 'енергія більше внутрішня: спершу варто розібратися з опором, сумнівами або невисловленими почуттями'
    : 'енергія більше зовнішня: уже є простір для рішень, руху й конкретної дії';
  const intensity = majorCount >= 2
    ? 'висока інтенсивність, бо старші аркани підсилюють значення всього розкладу'
    : 'м\'яка інтенсивність, де результат більше залежить від щоденних виборів';
  return `Загальний тон: ${balance}. Інтенсивність: ${intensity}. Домінантна сфера: ${dominantSuit}.`;
}

function buildInteractions(spread, tone) {
  if (spread.length < 2) return [];
  const pairs = [];
  for (let i = 0; i < spread.length - 1; i++) {
    const left = spread[i];
    const right = spread[i + 1];
    const leftKeywords = left.card.keywords.slice(0, 2).join(' і ');
    const rightKeywords = right.card.keywords.slice(0, 2).join(' і ');
    const tension = left.reversed || right.reversed
      ? 'створює напругу між заблокованою енергією та наступним кроком.'
      : 'підсилює плавний перехід від одного стану до іншого.';

    let connector;
    if (tone === 'mystic') connector = `наче поєднує ${leftKeywords} з ${rightKeywords}: це ${tension}`;
    else if (tone === 'practical') connector = `підказує практичний міст між темами «${leftKeywords}» та «${rightKeywords}»: це ${tension}`;
    else connector = `показує психологічний зв\'язок між «${leftKeywords}» та «${rightKeywords}»: це ${tension}`;

    pairs.push(`${left.position} → ${right.position}: «${left.card.name}» поруч із «${right.card.name}» ${connector}`);
  }
  if (spread.length >= 5) {
    pairs.push(`Вісь розкладу: «${spread[0].card.name}» задає сенс, а «${spread[2].card.name}» показує, як цей сенс може проявитися в реальності.`);
  }
  return pairs;
}

function buildAdvice(spread, tone) {
  return spread.slice(-2).map((item) => {
    const direction = item.reversed
      ? 'не тиснути силою, а спершу повернути собі ясність у цій темі'
      : 'використати цю енергію як опору для наступного кроку';
    if (tone === 'mystic') return `Через позицію «${item.position}» карта «${item.card.name}» радить прислухатися до знаку: ${meaning(item)} Тобто — ${direction}.`;
    if (tone === 'practical') return `У позиції «${item.position}» карта «${item.card.name}» дає дію: ${direction}. Орієнтир: ${meaning(item)}`;
    return `У позиції «${item.position}» карта «${item.card.name}» радить помітити свій внутрішній патерн: ${meaning(item)} Найздоровіший рух — ${direction}.`;
  });
}

function buildShadow(spread, tone) {
  const reversed = spread.find((item) => item.reversed) || spread.find((item) => item.card.arcana === 'major') || spread[0];
  const base = `Тіньова зона проявляється через «${reversed.card.name}» у позиції «${reversed.position}»: ${meaning(reversed)}`;
  if (tone === 'mystic') return `${base} Це місце, де символи радять не поспішати й не плутати знак із страхом.`;
  if (tone === 'practical') return `${base} Практично це означає: перевірити припущення, не приймати рішення з імпульсу й прибрати один зайвий ризик.`;
  return `${base} Психологічно це може бути точкою захисту: там, де хочеться контролювати, уникати або доводити.`;
}

function buildNextStep(focus, adviceCard, tone) {
  const actionKeyword = adviceCard.card.keywords[0] || 'ясність';
  const focusKeyword = focus.card.keywords[0] || 'фокус';
  if (tone === 'mystic') return `Сформулюй одне питання про «${focusKeyword}» і зроби маленький ритуальний крок у напрямку «${actionKeyword}». Не все треба вирішити сьогодні — достатньо відкрити правильні двері.`;
  if (tone === 'practical') return `Запиши один конкретний крок на найближчі 24 години: що ти зробиш із темою «${actionKeyword}», щоб розблокувати «${focusKeyword}».`;
  return `Поспостерігай, де тема «${focusKeyword}» викликає найбільшу реакцію, і обери м\'який крок у сторону «${actionKeyword}» без самотиску.`;
}

async function drawSpread(count, spreadType) {
  const definition = resolveSpread(count, spreadType);
  const cards = await getCards(78);
  const safeCount = Math.max(1, Math.min(definition.count, Math.min(cards.length, definition.positions.length)));
  const pool = [...cards];
  const spread = [];
  for (let i = 0; i < safeCount; i++) {
    const index = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(index, 1);
    const position = definition.positions[i];
    spread.push({ card, position: position.name, positionDescription: position.description, reversed: Math.random() > 0.5 });
  }
  return spread;
}

async function getCardOfDay(date) {
  const cards = await getCards(1);
  const dayKey = toDayKey(date || new Date());
  const h = hash(dayKey);
  return {
    card: cards[h % cards.length],
    position: 'Карта дня',
    positionDescription: 'Головна тема дня, на яку варто звернути увагу.',
    reversed: ((h >> 1) & 1) === 1,
  };
}

function generateRuleBasedInterpretation(spread, spreadType, tone) {
  if (!spread.length) {
    return { title: 'AI-тлумачення', tone: tone || 'psychological', summary: 'Спершу зробіть розклад, щоб отримати цілісне тлумачення.', energy: 'Енергія ще не визначена.', interactions: [], advice: [], shadow: 'Тіньова зона з\'явиться після вибору карт.', nextStep: 'Оберіть розклад і відкрийте карти.', provider: 'rule-based' };
  }

  const definition = resolveSpread(spread.length, spreadType);
  const normalizedTone = ['psychological', 'mystic', 'practical'].includes(tone) ? tone : 'psychological';
  const uprightCount = spread.filter((item) => !item.reversed).length;
  const reversedCount = spread.length - uprightCount;
  const majorCount = spread.filter((item) => item.card.arcana === 'major').length;
  const suits = spread.reduce((acc, item) => {
    const key = item.card.suit || 'Старші аркани';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dominantSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0]?.[0] || 'змішана енергія';

  return {
    title: `AI-тлумачення · ${definition.title}`,
    tone: normalizedTone,
    summary: buildSummary(spread, definition.title, normalizedTone, majorCount, reversedCount, dominantSuit),
    energy: buildEnergyLine(majorCount, reversedCount, uprightCount, dominantSuit),
    interactions: buildInteractions(spread, normalizedTone),
    advice: buildAdvice(spread, normalizedTone),
    shadow: buildShadow(spread, normalizedTone),
    nextStep: buildNextStep(spread[0], spread[spread.length - 1], normalizedTone),
    provider: 'rule-based',
  };
}

async function generateInterpretation(spread, spreadType, tone) {
  const fallback = generateRuleBasedInterpretation(spread, spreadType, tone);
  if (!spread.length) return fallback;

  const definition = resolveSpread(spread.length, spreadType);
  const llm = await generateLlmInterpretation({ spread, definition, tone: fallback.tone, fallback });
  return llm || fallback;
}

async function generateLlmInterpretation({ spread, definition, tone, fallback }) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '';
  if (!apiKey) return null;

  const endpoint = process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';
  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS || 20000);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const toneMap = { psychological: 'психологічний: внутрішні процеси, патерни, емоційна чесність, м\'яка підтримка', mystic: 'містичний: символи, архетипи, атмосфера, інтуїтивна мова без перебільшень', practical: 'практичний: конкретні висновки, рішення, ризики, наступні кроки' };

    const cards = spread.map((item, index) => ({
      index: index + 1,
      position: item.position,
      positionDescription: item.positionDescription,
      card: item.card.name,
      orientation: item.reversed ? 'перевернута' : 'пряма',
      arcana: item.card.arcana,
      suit: item.card.suit || 'Старші аркани',
      keywords: item.card.keywords,
      meaning: item.reversed ? item.card.meaningReversed : item.card.meaningUpright,
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(process.env.LLM_SITE_URL ? { 'HTTP-Referer': process.env.LLM_SITE_URL } : {}),
        ...(process.env.LLM_APP_NAME ? { 'X-Title': process.env.LLM_APP_NAME } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: Number(process.env.LLM_TEMPERATURE || 0.75),
        max_tokens: Number(process.env.LLM_MAX_TOKENS || 1200),
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'Ти український AI-інтерпретатор Таро для сучасного веб-додатку.',
              'Пиши українською, живо, тепло, глибоко, але без фаталізму.',
              'Не стверджуй майбутнє як факт. Формулюй як можливий напрям, символічну підказку або психологічний патерн.',
              'Не давай медичних, юридичних або фінансових гарантій.',
              'Аналізуй весь розклад цілісно: позиції, сусідство карт, повтори мастей, старші аркани, перевернуті карти.',
              'Відповідай тільки валідним JSON без markdown.',
              'JSON schema: {"title":"string","summary":"string","energy":"string","interactions":["string"],"advice":["string"],"shadow":"string","nextStep":"string"}',
            ].join('\n'),
          },
          {
            role: 'user',
            content: JSON.stringify({
              task: 'Згенеруй цілісне LLM-тлумачення розкладу Таро.',
              spread: { id: definition.id, title: definition.title, positions: definition.positions },
              tone,
              toneInstruction: toneMap[tone] || toneMap.psychological,
              cards,
              requirements: [
                'summary: 2-4 речення про головний сюжет розкладу.',
                'energy: короткий опис загальної енергії, домінантної масті/арканів і кількості перевернутих карт.',
                'interactions: 2-5 пунктів про взаємодію конкретних карт між собою.',
                'advice: 2-4 практичні або психологічні поради.',
                'shadow: одна чесна тіньова зона без залякування.',
                'nextStep: один конкретний крок на найближчі 24 години.',
                'Не вигадуй карт, використовуй тільки передані карти.',
              ],
            }),
          },
        ],
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.warn(`LLM request failed: ${response.status} ${details.slice(0, 300)}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = parseJson(content);
    return normalizeLlmResponse(parsed, fallback, tone);
  } catch (error) {
    console.warn(`LLM interpretation fallback used: ${error.message}`);
    return null;
  }
}

function parseJson(content) {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('LLM returned non-JSON content');
    return JSON.parse(match[0]);
  }
}

function normalizeLlmResponse(value, fallback, tone) {
  const source = (typeof value === 'object' && value !== null) ? value : {};
  return {
    title: stringValue(source.title, `LLM-тлумачення · ${fallback.title.replace(/^AI-тлумачення · /, '')}`),
    tone,
    summary: stringValue(source.summary, fallback.summary),
    energy: stringValue(source.energy, fallback.energy),
    interactions: stringArray(source.interactions, fallback.interactions),
    advice: stringArray(source.advice, fallback.advice),
    shadow: stringValue(source.shadow, fallback.shadow),
    nextStep: stringValue(source.nextStep, fallback.nextStep),
    provider: 'llm',
  };
}

function stringValue(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function stringArray(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item) => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim());
  return items.length ? items : fallback;
}

module.exports = {
  getCards,
  seedGremlinIfNeeded,
  getSpreadDefinitions: () => SPREAD_DEFINITIONS,
  drawSpread,
  getCardOfDay,
  generateInterpretation,
  TAROT_SEED,
};
