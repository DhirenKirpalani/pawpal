# PawPal Features Guide

Complete guide to all PawPal features integrated with WhatsApp.

## 🐾 Overview

PawPal now includes 6 comprehensive features accessible via WhatsApp:

1. **🤖 AI Health Advice** - Symptom analysis, food safety, behavior guidance
2. **⏰ Smart Reminders** - Vaccines, deworming, vet appointments, medication
3. **🍖 Feeding Tracker** - Meal schedules, portion tracking, feeding logs
4. **🚽 Potty Training** - Bathroom habit tracking, success rate statistics
5. **📝 Health Journal** - Log symptoms, incidents, unusual behavior
6. **🔔 Lost Pet Alert** - Report lost pets, track status, mark found

---

## 1. 🤖 AI Health Advice

### How It Works
Users can ask natural health questions and get AI-powered responses with risk assessment.

### Example Commands
```
"My dog is vomiting"
"Can cats eat tuna?"
"My puppy is not eating today"
"Is this rash serious?"
```

### Features
- Symptom analysis with risk levels (LOW, MEDIUM, HIGH, CRITICAL)
- Food safety checker for cats and dogs
- Behavior issue guidance
- Automatic vet recommendations for serious cases
- Bilingual support (English & Indonesian)

---

## 2. ⏰ Smart Reminders

### How It Works
Set reminders for important pet health events. Get notifications when they're due.

### Commands

#### Add Reminder
**English:**
```
"Vaccine on January 15"
"Deworming February 20"
"Vet appointment March 5"
"Medication reminder April 10"
```

**Indonesian:**
```
"Vaksin tanggal 15 Januari"
"Obat cacing 20 Februari"
"Janji dokter 5 Maret"
```

#### List Reminders
```
"List reminders"
"Show reminders"
"Lihat pengingat"
```

#### Complete Reminder
```
"Done"
"Complete"
"Selesai"
```

### Reminder Types
- 💉 Vaccine
- 💊 Deworming
- 🏥 Vet Appointment
- 💊 Medication
- 🩺 Health Checkup

### Notifications
- Automatic WhatsApp notifications 24 hours before due date
- Daily reminders for overdue items

---

## 3. 🍖 Feeding Tracker

### How It Works
Create feeding schedules and log actual feedings to maintain consistency.

### Commands

#### Log Feeding
**English:**
```
"Fed chicken 200 grams"
"Gave food 1 cup"
"Fed kibble"
```

**Indonesian:**
```
"Memberi makan ayam 200 gram"
"Kasih makan 1 cup"
```

#### Add Schedule
```
"Feeding schedule at 8:00 AM, portion 1 cup"
"Jadwal makan jam 8 pagi, porsi 200 gram"
"Schedule meal at 6 PM"
```

#### View Schedule
```
"Show feeding schedule"
"Feeding schedule"
"Lihat jadwal makan"
```

### Features
- Automatic meal time reminders
- Portion size tracking
- Meal history logs
- Personalized recommendations based on age & breed

### Notifications
- Hourly reminders at scheduled feeding times
- Portion size recommendations

---

## 4. 🚽 Potty Training

### How It Works
Track bathroom habits to monitor training progress and identify patterns.

### Commands

#### Log Potty Event
**English:**
```
"Poop in correct spot"
"Pee accident"
"Poop wrong spot"
"Pee in correct spot, soft consistency"
```

**Indonesian:**
```
"Pup di tempat yang benar"
"Pipis kecelakaan"
"Pup di tempat salah"
```

#### View Statistics
```
"Potty stats"
"Potty statistics"
"Statistik toilet"
"Progress"
```

### Tracked Data
- Event type (poop/pee)
- Location (correct spot, wrong spot, accident)
- Consistency (normal, soft, diarrhea, hard)
- Timestamp

### Statistics Provided
- Success rate (last 30 days)
- Total logs
- Correct spot count
- Accident count
- 7-day trend

---

## 5. 📝 Health Journal

### How It Works
Log important health observations, incidents, and unusual behaviors to share with your vet.

### Commands

#### Add Note
**English:**
```
"Note: Luna vomited this morning"
"Log health: Limping on left paw"
"Note behavior: More active than usual"
"Record incident: Ate something from trash"
```

**Indonesian:**
```
"Catat: Luna muntah pagi ini"
"Catat kesehatan: Pincang kaki kiri"
"Catat perilaku: Lebih aktif dari biasanya"
```

#### List Notes
```
"List notes"
"Show notes"
"Lihat catatan"
```

### Note Types
- 🏥 Health
- 🐾 Behavior
- 🍖 Food
- 📝 General
- ⚠️ Incident

### Severity Levels
- Normal
- Concern
- Urgent

---

## 6. 🔔 Lost Pet Alert

### How It Works
Quickly report a lost pet and track the alert status. Get action recommendations.

### Commands

#### Report Lost
**English:**
```
"Lost near the park"
"My pet is missing at Main Street"
"Lost pet"
```

**Indonesian:**
```
"Hilang di dekat taman"
"Hewan hilang di Jalan Utama"
```

#### Mark Found
```
"Found"
"Pet found"
"Ditemukan"
```

#### Check Status
```
"Lost pet status"
"Status hewan hilang"
```

### Alert Features
- Automatic timestamp
- Last seen location
- Duration tracking
- Action recommendations:
  - Search nearby areas
  - Contact neighbors
  - Post on social media
  - Contact animal shelters
  - Check microchip

### Post-Recovery Guidance
- Health check recommendations
- Hydration and feeding tips
- Injury inspection
- Vet visit suggestions

---

## 💡 General Commands

### Help Menu
```
"Help"
"Menu"
"Commands"
"Bantuan"
```

Returns a complete list of all available features and example commands.

---

## 🔧 Technical Implementation

### Architecture

```
WhatsApp Message
    ↓
Webhook Handler (app/api/whatsapp/webhook/route.ts)
    ↓
Chat Service (src/services/chat-service.ts)
    ↓
Feature Service (src/services/feature-service.ts)
    ↓
Command Parser (src/lib/features/command-parser.ts)
    ↓
Feature Handlers:
  - ReminderHandler
  - FeedingHandler
  - PottyHandler
  - NoteHandler
  - LostPetHandler
    ↓
Repositories → Supabase Database
    ↓
WhatsApp Response
```

### Database Tables

- `pet_reminders` - Reminder storage
- `feeding_schedules` - Meal schedules
- `feeding_logs` - Feeding history
- `potty_training_logs` - Potty events
- `pet_notes` - Health journal entries
- `lost_pet_alerts` - Lost pet reports

### Notification System

**Cron Endpoint:** `/api/cron/reminders`

**Schedule Recommendations:**
- Reminders: Every 6 hours (check for due reminders)
- Feeding: Every hour (check for scheduled meals)

**Setup with Vercel Cron:**
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Environment Variables Required:**
```
CRON_SECRET=your-secret-key
WHATSAPP_ACCESS_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

---

## 📊 Usage Examples

### Complete User Journey

1. **User sends:** "Help"
   - **PawPal responds:** Full menu of features

2. **User sends:** "Vaccine on June 15"
   - **PawPal responds:** ✅ Reminder added successfully

3. **User sends:** "Feeding schedule at 8 AM, portion 1 cup"
   - **PawPal responds:** ✅ Feeding schedule added

4. **User sends:** "Poop in correct spot"
   - **PawPal responds:** ✅ Potty log added, success rate updated

5. **User sends:** "Note: Max is limping"
   - **PawPal responds:** ✅ Health note saved

6. **User sends:** "My dog is vomiting"
   - **PawPal responds:** AI analysis with risk level and recommendations

---

## 🌍 Language Support

All features support both English and Indonesian:

- Automatic language detection
- Bilingual command recognition
- Localized responses
- Cultural context awareness

---

## 🔐 Security & Privacy

- User data encrypted in Supabase
- WhatsApp Cloud API official integration
- No data sharing with third parties
- GDPR compliant
- Secure webhook verification

---

## 📱 User Experience

### Response Format
All responses include:
- ✅ Success/failure indicator
- 📊 Relevant data/statistics
- 💡 Helpful tips and recommendations
- 🎯 Next action suggestions

### Error Handling
- Clear error messages
- Helpful guidance for corrections
- Fallback to AI chat for unrecognized commands

---

## 🚀 Future Enhancements

Planned features:
- Photo upload for symptoms
- Vet appointment booking
- Medication reminders with dosage
- Weight tracking graphs
- Multi-pet support
- Community features
- Emergency vet locator

---

## 📞 Support

For issues or questions:
- Check the help menu: Send "Help" to PawPal
- Review this guide
- Contact support team

---

**Last Updated:** June 4, 2026
**Version:** 2.0.0
