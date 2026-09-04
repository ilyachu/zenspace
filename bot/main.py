"""
ZenSpace Official Telegram Bot
Retention & Mindfulness Companion:
- WebApp Mini App launcher
- Morning poetic affirmations from ZenSpace Sky Quotes
- Evening breathing & sleep reminders
- Custom reminders scheduler with SQLite persistence
"""

import asyncio
import logging
import os
import random
import sqlite3
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env if present
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

from aiogram import Bot, Dispatcher, F, types
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    WebAppInfo,
)
from apscheduler.schedulers.asyncio import AsyncIOScheduler

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

# Zen Affirmations & Poetic Thoughts (matching ZenSpace core)
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

EVENING_REMINDERS = [
    "🌙 День подходит к концу. Сделайте 3 минуты осознанного дыхания, чтобы сбросить накопленное напряжение.",
    "✨ Время замедлиться. Включите звуки ночного костра или шума дождя в ZenSpace перед сном.",
    "🫁 Несколько циклов дыхания 4-7-8 помогут активировать парасимпатическую систему и спокойно уснуть.",
    "🧘 Освободите ум от задач дня. Всего 5 минут тишины вернут ясность и покой."
]

# Database Setup
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                morning_hour INTEGER DEFAULT 9,
                morning_minute INTEGER DEFAULT 0,
                evening_hour INTEGER DEFAULT 22,
                evening_minute INTEGER DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def save_user(user: types.User):
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

def get_all_active_users():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_id, first_name FROM users WHERE is_active = 1")
        return cursor.fetchall()

def set_reminder_time(user_id: int, rem_type: str, hour: int, minute: int):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        if rem_type == "morning":
            cursor.execute("UPDATE users SET morning_hour = ?, morning_minute = ? WHERE user_id = ?", (hour, minute, user_id))
        else:
            cursor.execute("UPDATE users SET evening_hour = ?, evening_minute = ? WHERE user_id = ?", (hour, minute, user_id))
        conn.commit()

# Keyboards
def get_main_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🧘 Войти в ZenSpace",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ],
        [
            InlineKeyboardButton(text="🫁 Дыхание 4-4-4-4", callback_data="btn_breathe"),
            InlineKeyboardButton(text="✨ Мысль дня", callback_data="btn_quote")
        ],
        [
            InlineKeyboardButton(text="⚡ Частоты Сольфеджио", callback_data="btn_freq"),
            InlineKeyboardButton(text="⚙️ Напоминания", callback_data="btn_settings")
        ]
    ])

# Bot and Dispatcher setup
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message, bot: Bot):
    if message.from_user:
        save_user(message.from_user)

    # Set Menu Button to open WebApp
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(
                text="ZenSpace",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        )
    except Exception as e:
        logger.debug(f"Menu button set warning: {e}")

    text = (
        f"Добро пожаловать в тишину, {message.from_user.first_name if message.from_user else 'друг'}.\n\n"
        "**ZenSpace** — это минималистичное пространство для медитаций, "
        "студийных голосовых практик (мужской и женский голос), "
        "дыхательных ритмов и звуковых ландшафтов природы.\n\n"
        "✨ **Я помогу вам сохранить регулярность:**\n"
        "• Утром пришлю вдохновляющую мысль для настройки дня;\n"
        "• Вечером мягко напомню о 5 минутах дыхания перед сном.\n\n"
        "Нажмите кнопку ниже, чтобы открыть приложение прямо в Telegram:"
    )

    await message.answer(
        text=text,
        reply_markup=get_main_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )

@dp.message(Command("zen"))
async def cmd_zen(message: types.Message):
    quote = random.choice(ZEN_AFFIRMATIONS)
    await message.answer(
        f"🌌 *Мысль из ночного неба ZenSpace:*\n\n«{quote}»",
        reply_markup=get_main_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )

@dp.message(Command("breathe"))
async def cmd_breathe(message: types.Message):
    text = (
        "🫁 *Квадратное дыхание (Box Breathing 4-4-4-4):*\n\n"
        "1. **Вдох** — 4 секунды (наполните лёгкие)\n"
        "2. **Задержка** — 4 секунды (покой)\n"
        "3. **Выдох** — 4 секунды (полное отпускание)\n"
        "4. **Пауза** — 4 секунды (тишина)\n\n"
        "Повторите 4–5 циклов прямо сейчас или откройте визуальный ритм в ZenSpace:"
    )
    await message.answer(
        text=text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🫁 Открыть ритм дыхания", web_app=WebAppInfo(url=f"{WEBAPP_URL}"))]
        ]),
        parse_mode=ParseMode.MARKDOWN
    )

@dp.message(Command("frequencies"))
async def cmd_frequencies(message: types.Message):
    text = (
        "⚡ *Частоты и бинауральные ритмы в ZenSpace:*\n\n"
        "• **432 Гц** — частота природной гармонии и глубокого снятия стресса;\n"
        "• **528 Гц** — легендарная частота Сольфеджио («Золотая середина»);\n"
        "• **Альфа-ритм (10 Гц)** — спокойная концентрация и ясность ума;\n"
        "• **Тета-ритм (6 Гц)** — глубокое медитативное погружение;\n"
        "• **Дельта-ритм (2.5 Гц)** — скорое засыпание и восстановительный сон.\n\n"
        "🎧 *Рекомендуется слушать в наушниках для стерео-эффекта.*"
    )
    await message.answer(
        text=text,
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🎧 Слушать частоты в приложении", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]),
        parse_mode=ParseMode.MARKDOWN
    )

# Callback queries
@dp.callback_query(F.data == "btn_quote")
async def cb_quote(callback: types.CallbackQuery):
    quote = random.choice(ZEN_AFFIRMATIONS)
    await callback.answer()
    await callback.message.answer(
        f"🌌 *Мысль из ночного неба ZenSpace:*\n\n«{quote}»",
        reply_markup=get_main_keyboard(),
        parse_mode=ParseMode.MARKDOWN
    )

@dp.callback_query(F.data == "btn_breathe")
async def cb_breathe(callback: types.CallbackQuery):
    await callback.answer()
    await cmd_breathe(callback.message)

@dp.callback_query(F.data == "btn_freq")
async def cb_freq(callback: types.CallbackQuery):
    await callback.answer()
    await cmd_frequencies(callback.message)

@dp.callback_query(F.data == "btn_settings")
async def cb_settings(callback: types.CallbackQuery):
    await callback.answer()
    text = (
        "⚙️ *Настройки напоминаний:*\n\n"
        "• Утреннее напутствие: **09:00**\n"
        "• Вечерняя практика: **22:00**\n\n"
        "Чтобы изменить время, отправьте команду:\n"
        "`/remind_morning 08:30` или `/remind_evening 23:00`"
    )
    await callback.message.answer(text, parse_mode=ParseMode.MARKDOWN)

# Scheduled Broadcasts
async def send_morning_affirmation(bot: Bot):
    users = get_all_active_users()
    quote = random.choice(ZEN_AFFIRMATIONS)
    text = (
        f"🌅 *Доброе утро.*\n\n"
        f"«{quote}»\n\n"
        f"Уделите 3 минуты спокойному дыханию перед началом дел."
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧘 3 минуты тишины", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

    for user_id, _ in users:
        try:
            await bot.send_message(user_id, text, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)
            await asyncio.sleep(0.05) # Rate-limiting
        except Exception as e:
            logger.debug(f"Failed morning alert to {user_id}: {e}")

async def send_evening_reminder(bot: Bot):
    users = get_all_active_users()
    msg = random.choice(EVENING_REMINDERS)
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🌙 Включить ночной покой", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

    for user_id, _ in users:
        try:
            await bot.send_message(user_id, msg, reply_markup=kb, parse_mode=ParseMode.MARKDOWN)
            await asyncio.sleep(0.05)
        except Exception as e:
            logger.debug(f"Failed evening alert to {user_id}: {e}")

# Application Entrypoint
async def main():
    if not BOT_TOKEN:
        print("\n[!] WARNING: BOT_TOKEN is not set.")
        print("Please set the BOT_TOKEN environment variable or put it in bot/.env.")
        print("Example: BOT_TOKEN='123456789:ABC...' python3 bot/main.py\n")
        return

    init_db()
    bot = Bot(token=BOT_TOKEN)

    # Initialize Scheduler
    scheduler = AsyncIOScheduler(timezone="Europe/Moscow")
    # Morning affirmation at 09:00 MSK
    scheduler.add_job(send_morning_affirmation, "cron", hour=9, minute=0, args=[bot])
    # Evening reminder at 22:00 MSK
    scheduler.add_job(send_evening_reminder, "cron", hour=22, minute=0, args=[bot])
    scheduler.start()

    logger.info("ZenSpace Bot started successfully! Listening for events...")
    try:
        await dp.start_polling(bot)
    finally:
        scheduler.shutdown()
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
