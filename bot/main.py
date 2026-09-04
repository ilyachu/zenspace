"""
ZenSpace Official Telegram Companion Bot & Mini App Bridge
==========================================================
Architecture:
- Native Telegram Mindfulness Experience (Audio Player, Breathwork, Frequencies, Mood Check-In, Habit Streak)
- Background Audio Streaming via Telegram Native Player (listen with screen locked)
- Telegram Mini App (TMA) One-Click Launcher
- Smart Reminders Engine with SQLite Persistence
"""

import asyncio
from datetime import date, datetime
import logging
import os
from pathlib import Path
import random
import sqlite3

from dotenv import load_dotenv

# Load .env if present
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    load_dotenv(env_file)

from aiogram import Bot, Dispatcher, F, types
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    FSInputFile,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    MenuButtonWebApp,
    ReplyKeyboardMarkup,
    WebAppInfo,
)
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("zenspace-bot")

# Configuration
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://zen.chuchuchu.ru")
DB_PATH = Path(__file__).parent / "zenspace_bot.db"
AUDIO_DIR = Path(__file__).parent.parent / "public" / "audio" / "meditations"
MOSCOW_TZ = pytz.timezone("Europe/Moscow")

# Meditations Catalog
MEDITATIONS = [
    {
        "id": "ru-bodyscan",
        "title": "🌿 Сканирование тела",
        "dur_female": "3:58",
        "dur_male": "1:46",
        "minutes": 4,
        "file_female": "ru-bodyscan.mp3",
        "file_male": "male-ru-bodyscan.mp3",
        "desc": "Снятие телесных зажимов, расслабление от макушки до стоп."
    },
    {
        "id": "ru-breathing",
        "title": "🫁 Осознанное дыхание",
        "dur_female": "7:50",
        "dur_male": "2:01",
        "minutes": 8,
        "file_female": "ru-breathing.mp3",
        "file_male": "male-ru-breathing.mp3",
        "desc": "Обучение глубокому фокусу на дыхании, остановка мысленной жвачки."
    },
    {
        "id": "ru-breathsoundbody",
        "title": "🔔 Дыхание, звуки и тело",
        "dur_female": "10:20",
        "dur_male": "1:09",
        "minutes": 10,
        "file_female": "ru-breathsoundbody.mp3",
        "file_male": "male-ru-breathsoundbody.mp3",
        "desc": "Глубокая гармонизация восприятия: тело, дыхание и звуки пространства."
    },
    {
        "id": "ru-lovingkindness",
        "title": "💛 Любящая доброта (Метта)",
        "dur_female": "9:00",
        "dur_male": "1:32",
        "minutes": 9,
        "file_female": "ru-lovingkindness.mp3",
        "file_male": "male-ru-lovingkindness.mp3",
        "desc": "Снижение тревожности, самокритики и взращивание душевного тепла."
    },
    {
        "id": "ru-complete",
        "title": "🌌 Полная сессия медитации",
        "dur_female": "19:40",
        "dur_male": "1:02",
        "minutes": 20,
        "file_female": "ru-complete.mp3",
        "file_male": "male-ru-complete.mp3",
        "desc": "Погружение в глубокую медитацию и тишину для восстановления сил."
    }
]

# Zen Quotes
ZEN_AFFIRMATIONS = [
    "ничего срочного сегодня",
    "вдох — покой, выдох — отпускание",
    "здесь и сейчас всё спокойно",
    "ум чист как ночное небо",
    "просто наблюдайте за дыханием",
    "тишина внутри вас",
    "возвращайтесь в настоящий момент",
    "позвольте мыслям приходить и уходить, словно облакам",
    "в паузе между вдохом и выдохом живёт покой",
    "ваше спокойствие — ваш главный ориентир сегодня",
    "отпустите спешку. мир подождёт пять минут",
    "гармония не ищется вовне — она вспоминается внутри"
]

# Database Layer
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                selected_voice TEXT DEFAULT 'female',
                morning_hour INTEGER DEFAULT 9,
                morning_minute INTEGER DEFAULT 0,
                morning_enabled INTEGER DEFAULT 1,
                evening_hour INTEGER DEFAULT 22,
                evening_minute INTEGER DEFAULT 0,
                evening_enabled INTEGER DEFAULT 1,
                streak_days INTEGER DEFAULT 0,
                last_practice_date TEXT,
                total_minutes INTEGER DEFAULT 0,
                completed_sessions INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def get_user(user_id: int):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return None
        columns = [col[0] for col in cursor.description]
        return dict(zip(columns, row))

def save_or_update_user(user: types.User):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (user_id, username, first_name)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                username = excluded.username,
                first_name = excluded.first_name,
                is_active = 1
        """, (user.id, user.username, user.first_name))
        conn.commit()

def set_user_voice(user_id: int, voice: str):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET selected_voice = ? WHERE user_id = ?", (voice, user_id))
        conn.commit()

def set_reminder(user_id: int, rem_type: str, hour: int, enabled: int = 1):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        if rem_type == "morning":
            cursor.execute("UPDATE users SET morning_hour = ?, morning_minute = 0, morning_enabled = ? WHERE user_id = ?", (hour, enabled, user_id))
        else:
            cursor.execute("UPDATE users SET evening_hour = ?, evening_minute = 0, evening_enabled = ? WHERE user_id = ?", (hour, enabled, user_id))
        conn.commit()

def add_practice_streak(user_id: int, minutes: int):
    today_str = date.today().isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT streak_days, last_practice_date, total_minutes, completed_sessions FROM users WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            return 1, minutes, 1
        streak, last_date, total_min, sessions = row
        streak = streak or 0
        total_min = total_min or 0
        sessions = sessions or 0

        if last_date == today_str:
            # Already completed today, just add minutes
            pass
        else:
            # Check if yesterday
            if last_date:
                try:
                    diff = (date.today() - date.fromisoformat(last_date)).days
                    if diff == 1:
                        streak += 1
                    else:
                        streak = 1
                except Exception:
                    streak = 1
            else:
                streak = 1

        total_min += minutes
        sessions += 1

        cursor.execute("""
            UPDATE users SET
                streak_days = ?,
                last_practice_date = ?,
                total_minutes = ?,
                completed_sessions = ?
            WHERE user_id = ?
        """, (streak, today_str, total_min, sessions, user_id))
        conn.commit()
        return streak, total_min, sessions

# Keyboards
def get_main_reply_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🧘 Медитации"), KeyboardButton(text="🫁 Дыхание")],
            [KeyboardButton(text="⚡ Частоты & Звуки"), KeyboardButton(text="✨ Чек-ин состояния")],
            [KeyboardButton(text="📊 Мой прогресс"), KeyboardButton(text="⚙️ Напоминания")],
            [KeyboardButton(text="🚀 Открыть ZenSpace (Mini App)", web_app=WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True,
        is_persistent=True
    )

def get_home_inline_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🧘 Медитации", callback_data="nav_meditations"),
            InlineKeyboardButton(text="🫁 Дыхание", callback_data="nav_breathe")
        ],
        [
            InlineKeyboardButton(text="⚡ Частоты & Звуки", callback_data="nav_frequencies"),
            InlineKeyboardButton(text="✨ Чек-ин дня", callback_data="nav_checkin")
        ],
        [
            InlineKeyboardButton(text="📊 Прогресс", callback_data="nav_progress"),
            InlineKeyboardButton(text="⚙️ Напоминания", callback_data="nav_reminders")
        ],
        [
            InlineKeyboardButton(text="📲 Запустить ZenSpace Mini App", web_app=WebAppInfo(url=WEBAPP_URL))
        ]
    ])

def get_meditations_keyboard(selected_voice: str) -> InlineKeyboardMarkup:
    voice_female_btn = "✅ ♀ Женский (Ингуна)" if selected_voice == "female" else "♀ Женский (Ингуна)"
    voice_male_btn = "✅ ♂ Мужской (Дмитрий)" if selected_voice == "male" else "♂ Мужской (Дмитрий)"

    rows = [
        [
            InlineKeyboardButton(text=voice_female_btn, callback_data="set_voice_female"),
            InlineKeyboardButton(text=voice_male_btn, callback_data="set_voice_male")
        ]
    ]

    for m in MEDITATIONS:
        dur = m["dur_male"] if selected_voice == "male" else m["dur_female"]
        rows.append([
            InlineKeyboardButton(
                text=f"{m['title']} ({dur})",
                callback_data=f"play_med_{m['id']}"
            )
        ])

    rows.append([
        InlineKeyboardButton(text="📲 Открыть в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=meditate")),
        InlineKeyboardButton(text="⬅️ Меню", callback_data="nav_home")
    ])
    return InlineKeyboardMarkup(inline_keyboard=rows)

def get_breathe_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔲 Квадрат 4-4-4-4 (Антистресс)", callback_data="breathe_box")],
        [InlineKeyboardButton(text="🌙 Релакс 4-7-8 (Глубокий сон)", callback_data="breathe_relax")],
        [InlineKeyboardButton(text="⚖️ Баланс 5.5с (Когерентное)", callback_data="breathe_coherent")],
        [
            InlineKeyboardButton(text="🫁 Запустить ритм в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=breathe")),
            InlineKeyboardButton(text="⬅️ Меню", callback_data="nav_home")
        ]
    ])

def get_frequencies_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="🎵 432 Гц (Гармония Верди)", callback_data="freq_432"),
            InlineKeyboardButton(text="✨ 528 Гц (Сольфеджио)", callback_data="freq_528")
        ],
        [
            InlineKeyboardButton(text="🧠 Альфа 10 Гц (Фокус)", callback_data="freq_alpha"),
            InlineKeyboardButton(text="🌌 Тета 6 Гц (Транс)", callback_data="freq_theta")
        ],
        [
            InlineKeyboardButton(text="💤 Дельта 2.5 Гц (Сон)", callback_data="freq_delta")
        ],
        [
            InlineKeyboardButton(text="🌲 Звуки природы (Костер, Дождь)", callback_data="freq_nature")
        ],
        [
            InlineKeyboardButton(text="🎧 Слушать в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=ambient")),
            InlineKeyboardButton(text="⬅️ Меню", callback_data="nav_home")
        ]
    ])

def get_checkin_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="😰 Тревога и стресс", callback_data="mood_stress")],
        [InlineKeyboardButton(text="🥱 Усталость и бессонница", callback_data="mood_tired")],
        [InlineKeyboardButton(text="🤯 Хаос в голове и расфокус", callback_data="mood_chaos")],
        [InlineKeyboardButton(text="😌 Спокоен, хочу практику", callback_data="mood_calm")],
        [InlineKeyboardButton(text="⬅️ Назад в меню", callback_data="nav_home")]
    ])

def get_reminders_keyboard(user: dict) -> InlineKeyboardMarkup:
    m_h = user.get("morning_hour", 9)
    m_on = user.get("morning_enabled", 1)
    e_h = user.get("evening_hour", 22)
    e_on = user.get("evening_enabled", 1)

    m_status = f"{m_h:02d}:00" if m_on else "Выкл"
    e_status = f"{e_h:02d}:00" if e_on else "Выкл"

    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=f"🌅 Утро (сейчас: {m_status}):", callback_data="noop")],
        [
            InlineKeyboardButton(text="07:00", callback_data="rem_m_7"),
            InlineKeyboardButton(text="08:00", callback_data="rem_m_8"),
            InlineKeyboardButton(text="09:00", callback_data="rem_m_9"),
            InlineKeyboardButton(text="10:00", callback_data="rem_m_10"),
            InlineKeyboardButton(text="🔕 Выкл", callback_data="rem_m_0")
        ],
        [InlineKeyboardButton(text=f"🌙 Вечер (сейчас: {e_status}):", callback_data="noop")],
        [
            InlineKeyboardButton(text="21:00", callback_data="rem_e_21"),
            InlineKeyboardButton(text="21:30", callback_data="rem_e_2130"),
            InlineKeyboardButton(text="22:00", callback_data="rem_e_22"),
            InlineKeyboardButton(text="23:00", callback_data="rem_e_23"),
            InlineKeyboardButton(text="🔕 Выкл", callback_data="rem_e_0")
        ],
        [InlineKeyboardButton(text="⬅️ В главное меню", callback_data="nav_home")]
    ])

# Bot Dispatcher
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message, bot: Bot):
    if message.from_user:
        save_or_update_user(message.from_user)

    # Set Menu Button
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="ZenSpace",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        )
    except Exception as e:
        logger.debug(f"MenuButtonWebApp error: {e}")

    quote = random.choice(ZEN_AFFIRMATIONS)
    name = message.from_user.first_name if message.from_user else "друг"

    text = (
        f"Добро пожаловать в тишину, {name}.\n\n"
        f"🌌 *«{quote}»*\n\n"
        "**ZenSpace** — ваше персональное пространство осознанности прямо в Telegram:\n"
        "• 🧘 **Медитации** — слушайте в фоне Telegram с выключенным экраном\n"
        "• 🫁 **Дыхательные ритмы** — антистресс Квадрат 4-4-4-4 и Релакс 4-7-8\n"
        "• ⚡ **Частоты Сольфеджио** — 432 Гц, 528 Гц и бинауральные ритмы\n"
        "• 🔥 **Трекер привычки** — сохраняйте серию дней осознанности\n\n"
        "Выберите раздел ниже или запустите визуальный режим в Mini App:"
    )

    await message.answer(
        text=text,
        reply_markup=get_main_reply_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )
    await message.answer(
        text="✨ Быстрая навигация:",
        reply_markup=get_home_inline_keyboard()
    )

# Text Navigation (from Reply Keyboard)
@dp.message(F.text == "🧘 Медитации")
async def msg_meditations(message: types.Message):
    user = get_user(message.from_user.id)
    voice = user.get("selected_voice", "female") if user else "female"
    text = (
        "🧘 *Голосовые студийные медитации*\n\n"
        "Аудиофайлы отправляются прямо в чат — вы можете свернуть Telegram, "
        "заблокировать экран и слушать практику в наушниках.\n\n"
        f"Текущий голос диктора: **{'♀ Женский (Ингуна)' if voice == 'female' else '♂ Мужской (Дмитрий)'}**.\n"
        "Выберите голос и желаемую практику:"
    )
    await message.answer(text, reply_markup=get_meditations_keyboard(voice), parse_mode=ParseMode.MARKDOWN)

@dp.message(F.text == "🫁 Дыхание")
async def msg_breathe(message: types.Message):
    text = (
        "🫁 *Осознанное дыхание и саморегуляция*\n\n"
        "Дыхание — единственный рычаг прямого управления вегетативной нервной системой.\n\n"
        "• **Квадрат 4-4-4-4:** За 3 минуты сбивает стресс, снижает пульс и возвращает ясный фокус.\n"
        "• **Релакс 4-7-8:** Метод доктора Эндрю Вейла для скорого засыпания и глубокого релакса.\n"
        "• **Баланс 5.5с:** Когерентное дыхание для синхронизации сердечного ритма (HRV).\n\n"
        "Выберите практику для ознакомления или запустите анимированное кольцо в Mini App:"
    )
    await message.answer(text, reply_markup=get_breathe_keyboard(), parse_mode=ParseMode.MARKDOWN)

@dp.message(F.text == "⚡ Частоты & Звуки")
async def msg_frequencies(message: types.Message):
    text = (
        "⚡ *Частоты Сольфеджио, Бинауральные волны и Природа*\n\n"
        "Звуковая терапия на чистых колебаниях:\n\n"
        "• **432 Гц** — естественный строй Верди, резонирующий с биологическими ритмами;\n"
        "• **528 Гц** — легендарная частота трансформации и снижения кортизола;\n"
        "• **Альфа (10 Гц)** — рабочий фокус и состояние «потока»;\n"
        "• **Тета (6 Гц)** — глубокая медитация и творческое озарение;\n"
        "• **Дельта (2.5 Гц)** — быстрое погружение в восстановительный сон.\n\n"
        "🎧 *Бинауральные ритмы рекомендуется слушать в стереонаушниках.*"
    )
    await message.answer(text, reply_markup=get_frequencies_keyboard(), parse_mode=ParseMode.MARKDOWN)

@dp.message(F.text == "✨ Чек-ин состояния")
async def msg_checkin(message: types.Message):
    text = (
        "✨ *Чек-ин осознанности*\n\n"
        "Сделайте короткую паузу. Почувствуйте опору под стопами, плечи и дыхание.\n\n"
        "**Как вы себя чувствуете прямо сейчас?**"
    )
    await message.answer(text, reply_markup=get_checkin_keyboard(), parse_mode=ParseMode.MARKDOWN)

@dp.message(F.text == "📊 Мой прогресс")
async def msg_progress(message: types.Message):
    user = get_user(message.from_user.id)
    streak = user.get("streak_days", 0) if user else 0
    total_min = user.get("total_minutes", 0) if user else 0
    sessions = user.get("completed_sessions", 0) if user else 0
    last_date = user.get("last_practice_date", "ещё не было") if user else "ещё не было"

    status_icon = "🔥" if streak > 0 else "🌱"

    text = (
        f"📊 *Ваш прогресс в ZenSpace*\n\n"
        f"{status_icon} **Серия практики:** {streak} дн. подряд\n"
        f"⏱️ **Всего минут тишины:** {total_min} мин\n"
        f"🧘 **Завершено практик:** {sessions}\n"
        f"📅 **Последняя сессия:** {last_date}\n\n"
        f"Каждый день, уделенный себе, формирует устойчивую нейронную привычку спокойствия."
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧘 Практиковать сейчас", callback_data="nav_meditations")],
        [InlineKeyboardButton(text="📲 Открыть дневник в Mini App", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await message.answer(text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.message(F.text == "⚙️ Напоминания")
async def msg_reminders(message: types.Message):
    user = get_user(message.from_user.id) or {}
    text = (
        "⚙️ *Настройка ежедневных напоминаний*\n\n"
        "Регулярность — главный секрет эффекта медитации.\n"
        "Бот может присылать вдохновляющую мысль утром и мягко напоминать о дыхании перед сном.\n\n"
        "Нажмите на нужное время (по МСК), чтобы изменить расписание:"
    )
    await message.answer(text, reply_markup=get_reminders_keyboard(user), parse_mode=ParseMode.MARKDOWN)

# Callback Navigation Handlers
@dp.callback_query(F.data == "nav_home")
async def cb_home(call: types.CallbackQuery):
    await call.answer()
    await call.message.edit_text(
        "🌌 *Главное меню ZenSpace*\nВыберите раздел для продолжения:",
        reply_markup=get_home_inline_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )

@dp.callback_query(F.data == "nav_meditations")
async def cb_meditations(call: types.CallbackQuery):
    await call.answer()
    user = get_user(call.from_user.id)
    voice = user.get("selected_voice", "female") if user else "female"
    text = (
        "🧘 *Голосовые медитации*\n\n"
        f"Диктор: **{'♀ Женский (Ингуна)' if voice == 'female' else '♂ Мужской (Дмитрий)'}**.\n"
        "Выберите практику для отправки в Telegram-плеер:"
    )
    await call.message.edit_text(text, reply_markup=get_meditations_keyboard(voice), parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data.startswith("set_voice_"))
async def cb_set_voice(call: types.CallbackQuery):
    new_voice = "male" if "male" in call.data else "female"
    set_user_voice(call.from_user.id, new_voice)
    await call.answer(f"Голос изменен на: {'Мужской' if new_voice == 'male' else 'Женский'}")
    text = (
        "🧘 *Голосовые медитации*\n\n"
        f"Диктор: **{'♀ Женский (Ингуна)' if new_voice == 'female' else '♂ Мужской (Дмитрий)'}**.\n"
        "Выберите практику для прослушивания:"
    )
    await call.message.edit_text(text, reply_markup=get_meditations_keyboard(new_voice), parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data.startswith("play_med_"))
async def cb_play_meditation(call: types.CallbackQuery, bot: Bot):
    med_id = call.data.replace("play_med_", "")
    user = get_user(call.from_user.id)
    voice = user.get("selected_voice", "female") if user else "female"

    med = next((m for m in MEDITATIONS if m["id"] == med_id), None)
    if not med:
        await call.answer("Медитация не найдена")
        return

    await call.answer("Отправляю аудиозапись...")

    filename = med["file_male"] if voice == "male" else med["file_female"]
    filepath = AUDIO_DIR / filename
    performer_name = "ZenSpace // Дмитрий" if voice == "male" else "ZenSpace // Ингуна"

    caption = (
        f"🧘 *{med['title']}*\n\n"
        f"🎙️ Диктор: {performer_name}\n"
        f"✨ {med['desc']}\n\n"
        f"🎧 *Слушайте в наушниках. Вы можете свернуть Telegram и выключить экран.*"
    )

    complete_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=f"✅ Я завершил практику (+{med['minutes']} мин)", callback_data=f"done_med_{med['minutes']}")],
        [InlineKeyboardButton(text="📲 Открыть в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=meditate"))]
    ])

    if filepath.exists():
        audio_file = FSInputFile(path=filepath, filename=f"{med_id}_{voice}.mp3")
        await bot.send_audio(
            chat_id=call.message.chat.id,
            audio=audio_file,
            title=med["title"],
            performer=performer_name,
            caption=caption,
            reply_markup=complete_kb,
            parse_mode=ParseMode.MARKDOWN
        )
    else:
        # Fallback to web link if file missing
        url = f"{WEBAPP_URL}/audio/meditations/{filename}"
        await bot.send_audio(
            chat_id=call.message.chat.id,
            audio=url,
            title=med["title"],
            performer=performer_name,
            caption=caption,
            reply_markup=complete_kb,
            parse_mode=ParseMode.MARKDOWN
        )

@dp.callback_query(F.data.startswith("done_med_"))
async def cb_done_meditation(call: types.CallbackQuery):
    minutes = int(call.data.replace("done_med_", ""))
    streak, total_min, sessions = add_practice_streak(call.from_user.id, minutes)
    await call.answer("Практика сохранена в прогресс! 🌟")

    quote = random.choice(ZEN_AFFIRMATIONS)
    text = (
        f"🌟 *Сессия завершена!*\n\n"
        f"🔥 **Текущая серия:** {streak} дн. подряд\n"
        f"⏱️ **Всего в тишине:** {total_min} минут ({sessions} сессий)\n\n"
        f"🌌 *«{quote}»*\n\n"
        f"Спасибо за заботу о себе сегодня."
    )
    await call.message.reply(text, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "nav_breathe")
async def cb_nav_breathe(call: types.CallbackQuery):
    await call.answer()
    await msg_breathe(call.message)

@dp.callback_query(F.data == "breathe_box")
async def cb_breathe_box(call: types.CallbackQuery):
    await call.answer()
    text = (
        "🔲 *Квадратное дыхание (Box Breathing 4-4-4-4)*\n\n"
        "Техника спецподразделений для мгновенного снятия паники и перезагрузки:\n\n"
        "1. **Вдох носом** — 4 сек (наполняем легкие и диафрагму)\n"
        "2. **Задержка** — 4 сек (удерживаем воздух в покое)\n"
        "3. **Выдох ртом** — 4 сек (полное мягкое расслабление)\n"
        "4. **Пауза** — 4 сек (пустота и ясность)\n\n"
        "Повторите 4–6 циклов прямо сейчас или откройте пульсирующий круг в Mini App:"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🫁 Запустить Квадрат в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=breathe&pattern=box"))],
        [InlineKeyboardButton(text="⬅️ Другие техники", callback_data="nav_breathe")]
    ])
    await call.message.edit_text(text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "breathe_relax")
async def cb_breathe_relax(call: types.CallbackQuery):
    await call.answer()
    text = (
        "🌙 *Релакс-дыхание 4-7-8 (Эндрю Вейл)*\n\n"
        "«Природный транквилизатор» для нервной системы:\n\n"
        "1. **Вдох носом** — 4 сек\n"
        "2. **Задержка дыхания** — 7 сек (насыщение кислородом)\n"
        "3. **Шумный выдох через рот** — 8 сек (активация блуждающего нерва)\n\n"
        "Идеально перед сном или при сильном эмоциональном перегрузе."
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🌙 Запустить 4-7-8 в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=breathe&pattern=relax"))],
        [InlineKeyboardButton(text="⬅️ Другие техники", callback_data="nav_breathe")]
    ])
    await call.message.edit_text(text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "breathe_coherent")
async def cb_breathe_coherent(call: types.CallbackQuery):
    await call.answer()
    text = (
        "⚖️ *Когерентное дыхание (Баланс 5.5с)*\n\n"
        "Ровный непрерывный ритм: 5.5 сек вдох, 5.5 сек выдох (около 5.5 циклов в минуту).\n\n"
        "Синхронизирует сердечный ритм с дыхательным циклом, снижает артериальное давление и повышает стрессоустойчивость (HRV)."
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚖️ Запустить Баланс в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=breathe&pattern=coherent"))],
        [InlineKeyboardButton(text="⬅️ Другие техники", callback_data="nav_breathe")]
    ])
    await call.message.edit_text(text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "nav_frequencies")
async def cb_nav_freq(call: types.CallbackQuery):
    await call.answer()
    await msg_frequencies(call.message)

@dp.callback_query(F.data.startswith("freq_"))
async def cb_freq_info(call: types.CallbackQuery):
    key = call.data.replace("freq_", "")
    info_dict = {
        "432": ("🎵 *432 Гц — Гармония природы*", "Чистая частота естественного строя Верди. Замедляет пульс, снижает частоту сердечных сокращений и возвращает чувство безопасности."),
        "528": ("✨ *528 Гц — Частота Сольфеджио*", "Один из ключевых тонов древней шкалы Сольфеджио. Исследования показывают снижение уровня кортизола и восстановление биоритмов."),
        "alpha": ("🧠 *Альфа-ритм (10 Гц)*", "Бинауральный ритм для расслабленного бодрствования. Идеально подходит для чтения, творческой работы и состояния потока."),
        "theta": ("🌌 *Тета-ритм (6 Гц)*", "Волны глубокой медитации, транса и интуитивных инсайтов. Переходное состояние между бодрствованием и сном."),
        "delta": ("💤 *Дельта-ритм (2.5 Гц)*", "Самые медленные мозговые волны. Активируют глубокий восстановительный сон и процессы клеточной регенерации."),
        "nature": ("🌲 *Звуковые ландшафты природы*", "Бесшовные стерео-лупы: живой треск костра, ночной лес, теплый дождь, волны океана и горный ветер.")
    }
    title, desc = info_dict.get(key, ("⚡ Частоты", "Звуковая атмосфера"))
    text = f"{title}\n\n{desc}\n\nВ приложении частоты генерируются на лету в Web Audio API без потери качества:"
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🎧 Слушать в Mini App", web_app=WebAppInfo(url=f"{WEBAPP_URL}?mode=ambient"))],
        [InlineKeyboardButton(text="⬅️ К списку частот", callback_data="nav_frequencies")]
    ])
    await call.message.edit_text(text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "nav_checkin")
async def cb_nav_checkin(call: types.CallbackQuery):
    await call.answer()
    await msg_checkin(call.message)

@dp.callback_query(F.data.startswith("mood_"))
async def cb_mood_response(call: types.CallbackQuery):
    mood = call.data.replace("mood_", "")
    responses = {
        "stress": (
            "🫁 *Рекомендация при стрессе и тревоге:*\n\n"
            "Прямо сейчас сделайте 4 цикла **Квадратного дыхания (4-4-4-4)**, "
            "чтобы перезагрузить нервную систему, а затем включите **частоту 432 Гц**."
        ),
        "tired": (
            "🌙 *Рекомендация при усталости и бессоннице:*\n\n"
            "Вам поможет **Релакс-дыхание 4-7-8** и **Дельта-ритм (2.5 Гц)**. "
            "Сделайте практику в постели перед сном."
        ),
        "chaos": (
            "🌿 *Рекомендация при хаосе в мыслях:*\n\n"
            "Попробуйте **Сканирование тела (4 мин)**. "
            "Возвращение внимания в физические ощущения немедленно останавливает мысленную жвачку."
        ),
        "calm": (
            "🌌 *Прекрасный момент для углубления:*\n\n"
            "Пройдите **Осознанное дыхание (8 мин)** или **Метту (Любящую доброту)**, "
            "чтобы закрепить ресурсное состояние на весь день."
        )
    }
    rec_text = responses.get(mood, "Практикуйте осознанность сегодня.")
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧘 Перейти к практикам", callback_data="nav_meditations")],
        [InlineKeyboardButton(text="📲 Открыть в Mini App", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])
    await call.message.edit_text(rec_text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)

@dp.callback_query(F.data == "nav_progress")
async def cb_nav_progress(call: types.CallbackQuery):
    await call.answer()
    await msg_progress(call.message)

@dp.callback_query(F.data == "nav_reminders")
async def cb_nav_reminders(call: types.CallbackQuery):
    await call.answer()
    await msg_reminders(call.message)

@dp.callback_query(F.data.startswith("rem_"))
async def cb_set_reminder(call: types.CallbackQuery):
    data = call.data
    user_id = call.from_user.id

    if data.startswith("rem_m_"):
        val = data.replace("rem_m_", "")
        hour = int(val)
        enabled = 0 if hour == 0 else 1
        set_reminder(user_id, "morning", hour if hour > 0 else 9, enabled)
        await call.answer("Утреннее напоминание обновлено!")
    elif data.startswith("rem_e_"):
        val = data.replace("rem_e_", "")
        hour = 21 if val == "2130" else int(val)
        enabled = 0 if hour == 0 else 1
        set_reminder(user_id, "evening", hour if hour > 0 else 22, enabled)
        await call.answer("Вечернее напоминание обновлено!")

    user = get_user(user_id) or {}
    await call.message.edit_reply_markup(reply_markup=get_reminders_keyboard(user))

@dp.callback_query(F.data == "noop")
async def cb_noop(call: types.CallbackQuery):
    await call.answer()

# Scheduled Tasks (APScheduler)
async def check_scheduled_reminders(bot: Bot):
    now_msk = datetime.now(MOSCOW_TZ)
    current_hour = now_msk.hour
    current_minute = now_msk.minute

    # Only fire on top of the hour or half hour (minute == 0)
    if current_minute != 0:
        return

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # 1. Morning notifications
        cursor.execute("SELECT user_id, first_name FROM users WHERE morning_enabled = 1 AND morning_hour = ? AND is_active = 1", (current_hour,))
        morning_users = cursor.fetchall()
        for user_id, name in morning_users:
            try:
                quote = random.choice(ZEN_AFFIRMATIONS)
                text = (
                    f"🌅 *Доброе утро, {name or 'друг'}.*\n\n"
                    f"«{quote}»\n\n"
                    "Уделите 3 минуты спокойному дыханию перед началом дел."
                )
                kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🧘 3 минуты тишины", web_app=WebAppInfo(url=WEBAPP_URL))]
                ])
                await bot.send_message(user_id, text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)
                await asyncio.sleep(0.05)
            except Exception as e:
                logger.debug(f"Morning reminder fail {user_id}: {e}")

        # 2. Evening notifications
        cursor.execute("SELECT user_id, first_name FROM users WHERE evening_enabled = 1 AND evening_hour = ? AND is_active = 1", (current_hour,))
        evening_users = cursor.fetchall()
        for user_id, name in evening_users:
            try:
                text = (
                    f"🌙 *Добрый вечер, {name or 'друг'}.*\n\n"
                    "День завершается. Сделайте несколько циклов дыхания 4-7-8 или включите звуки ночного костра, чтобы отпустить напряжение."
                )
                kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🌙 Включить ночной покой", web_app=WebAppInfo(url=WEBAPP_URL))]
                ])
                await bot.send_message(user_id, text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)
                await asyncio.sleep(0.05)
            except Exception as e:
                logger.debug(f"Evening reminder fail {user_id}: {e}")

# Application Entrypoint
async def main():
    if not BOT_TOKEN:
        print("\n[!] BOT_TOKEN is empty in environment or .env file.")
        print("Please set BOT_TOKEN in bot/.env\n")
        return

    init_db()
    bot = Bot(token=BOT_TOKEN)

    # Initialize Scheduler every minute
    scheduler = AsyncIOScheduler(timezone=MOSCOW_TZ)
    scheduler.add_job(check_scheduled_reminders, "cron", minute="*", args=[bot])
    scheduler.start()

    logger.info("ZenSpace Full-Featured Bot started successfully! Polling...")
    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown()
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
