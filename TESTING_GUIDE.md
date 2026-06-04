# PawPal Testing Guide

Complete guide to testing all features via WhatsApp.

## 🎯 Prerequisites

1. **WhatsApp Setup:**
   - Have WhatsApp installed on your phone
   - Save the PawPal WhatsApp number
   - Ensure you have an active internet connection

2. **User Onboarding:**
   - First message triggers user creation
   - Pet profile should be created (if testing features that require a pet)

3. **Environment:**
   - Development server running: `npm run dev`
   - Webhook configured and verified
   - Database migrations applied

---

## 📋 How Each Feature Works

### Architecture Flow

```
User sends WhatsApp message
    ↓
WhatsApp Cloud API receives message
    ↓
Webhook POST to /api/whatsapp/webhook
    ↓
ChatService.processMessage()
    ↓
FeatureService.processFeatureCommand()
    ↓
CommandParser.parse() - Detects feature command
    ↓
Route to appropriate handler:
  - ReminderHandler
  - FeedingHandler
  - PottyHandler
  - NoteHandler
  - LostPetHandler
    ↓
Handler processes and saves to database
    ↓
Response sent back via WhatsApp
```

---

## 1. ⏰ Smart Reminders

### How It Works

**Technical Flow:**
1. User sends message with reminder keywords
2. `CommandParser` detects reminder intent
3. `ReminderHandler.addReminder()` called
4. Date parsed from natural language
5. Saved to `pet_reminders` table
6. Confirmation sent to user

**Database Schema:**
```sql
pet_reminders (
  id UUID,
  pet_id UUID,
  reminder_type TEXT (vaccine|deworming|vet_appointment|medication|checkup),
  title TEXT,
  due_date TIMESTAMP,
  completed BOOLEAN,
  recurring BOOLEAN
)
```

### Test Scenarios

#### Test 1: Add Vaccine Reminder (English)
**Send:**
```
Vaccine on January 15
```

**Expected Response:**
```
✅ Reminder added successfully!

📅 Vaccination
🗓️ Date: 15 January 2026

We'll remind you when it's time.
```

**Verify in Database:**
```sql
SELECT * FROM pet_reminders WHERE reminder_type = 'vaccine';
```

#### Test 2: Add Deworming Reminder (Indonesian)
**Send:**
```
Obat cacing tanggal 20 Februari
```

**Expected Response:**
```
✅ Pengingat berhasil ditambahkan!

📅 Obat Cacing
🗓️ Tanggal: 20 Februari 2026

Kami akan mengingatkan Anda saat waktunya tiba.
```

#### Test 3: List Reminders
**Send:**
```
List reminders
```

**Expected Response:**
```
📋 Upcoming Reminders:

1. 💉 Vaccination
   📅 15 January 2026

2. 💊 Obat Cacing
   📅 20 February 2026

💡 Reply "done [number]" to mark a reminder as complete.
```

#### Test 4: Complete Reminder
**Send:**
```
Done
```

**Expected Response:**
```
✅ Reminder completed: Vaccination

🎉 Great job! Keep taking care of your pet's health.
```

#### Test 5: Invalid Date Format
**Send:**
```
Vaccine tomorrow
```

**Expected Response:**
```
❌ Invalid date format. Use formats like: "15/01/2024" or "January 15"
```

---

## 2. 🍖 Feeding Tracker

### How It Works

**Technical Flow:**
1. User sends feeding-related message
2. `CommandParser` detects feeding keywords
3. Routes to `FeedingHandler`
4. Parses time/portion from message
5. Saves to `feeding_schedules` or `feeding_logs`
6. Confirmation sent

**Database Schema:**
```sql
feeding_schedules (
  id UUID,
  pet_id UUID,
  meal_time TIME,
  meal_name TEXT,
  portion_size TEXT,
  active BOOLEAN
)

feeding_logs (
  id UUID,
  pet_id UUID,
  food_type TEXT,
  portion_size TEXT,
  fed_at TIMESTAMP
)
```

### Test Scenarios

#### Test 1: Add Feeding Schedule
**Send:**
```
Feeding schedule at 8:00 AM, portion 1 cup
```

**Expected Response:**
```
✅ Feeding schedule added!

⏰ Time: 08:00:00
📏 Portion: 1 cup

💡 We'll remind you when it's feeding time.
```

#### Test 2: Log Feeding
**Send:**
```
Fed chicken 200 grams
```

**Expected Response:**
```
✅ Feeding logged successfully!

🍖 Food: chicken
📏 Portion: 200 grams

💡 Tip: Consistent portions help maintain ideal weight.
```

#### Test 3: View Schedule
**Send:**
```
Show feeding schedule
```

**Expected Response:**
```
📋 Feeding Schedule:

1. ⏰ 08:00:00 - Breakfast
   📏 1 cup

💡 Reply "Fed" after feeding to log it.
```

#### Test 4: Multiple Meal Times
**Send:**
```
Jadwal makan jam 6 sore, porsi 150 gram
```

**Expected Response:**
```
✅ Jadwal makan berhasil ditambahkan!

⏰ Waktu: 18:00:00
📏 Porsi: 150 gram

💡 Kami akan mengingatkan Anda saat waktu makan tiba.
```

---

## 3. 🚽 Potty Training

### How It Works

**Technical Flow:**
1. User sends potty-related message
2. `CommandParser` detects potty keywords
3. Extracts event type, location, consistency
4. `PottyHandler.logPotty()` saves to database
5. Calculates success rate
6. Returns confirmation with encouragement

**Database Schema:**
```sql
potty_training_logs (
  id UUID,
  pet_id UUID,
  event_type TEXT (poop|pee),
  location TEXT (correct_spot|wrong_spot|accident),
  consistency TEXT (normal|soft|diarrhea|hard),
  logged_at TIMESTAMP
)
```

### Test Scenarios

#### Test 1: Log Success
**Send:**
```
Poop in correct spot
```

**Expected Response:**
```
✅ Potty log added successfully!

🚽 Type: Poop
📍 Location: Correct spot
💩 Consistency: normal

🎉 Great job! Keep training consistently.
```

#### Test 2: Log Accident
**Send:**
```
Pee accident
```

**Expected Response:**
```
⚠️ Potty log added successfully!

🚽 Type: Pee
📍 Location: Accident

💡 Don't worry, keep training patiently and consistently.
```

#### Test 3: View Statistics
**Send:**
```
Potty stats
```

**Expected Response:**
```
📊 Potty Statistics (Last 30 days):

✅ Success Rate: 67%
📝 Total Logs: 15
🎯 Correct Spot: 10
⚠️ Accidents: 5

📅 Last 7 Days: 8 logs

👍 Good progress! Keep being consistent.
```

#### Test 4: With Consistency Info
**Send:**
```
Pup di tempat yang benar, konsistensi lembek
```

**Expected Response:**
```
✅ Catatan toilet berhasil ditambahkan!

🚽 Jenis: Pup
📍 Lokasi: Tempat yang benar
💩 Konsistensi: soft

🎉 Bagus sekali! Terus latih dengan konsisten.
```

---

## 4. 📝 Health Journal

### How It Works

**Technical Flow:**
1. User sends note/log message
2. `CommandParser` detects note keywords
3. Extracts note type and severity
4. `NoteHandler.addNote()` saves entry
5. Auto-generates title from content
6. Stores in `pet_notes` table

**Database Schema:**
```sql
pet_notes (
  id UUID,
  pet_id UUID,
  note_type TEXT (health|behavior|food|general|incident),
  title TEXT,
  content TEXT,
  severity TEXT (normal|concern|urgent),
  created_at TIMESTAMP
)
```

### Test Scenarios

#### Test 1: Add Health Note
**Send:**
```
Note: Luna vomited this morning
```

**Expected Response:**
```
🏥 Note added successfully!

📝 Level: Normal
📋 Type: General

💡 Your note is saved and can be shared with your vet when needed.
```

#### Test 2: Add Urgent Note
**Send:**
```
Note urgent: Max is limping badly on left paw
```

**Expected Response:**
```
🏥 Note added successfully!

🚨 Level: Urgent
📋 Type: Health

💡 Your note is saved and can be shared with your vet when needed.
```

#### Test 3: List Notes
**Send:**
```
List notes
```

**Expected Response:**
```
📋 Recent Notes:

1. 🏥 Luna vomited this morning
   📅 4 Jun
   Luna vomited this morning

2. 🏥🚨 Max is limping badly on left paw
   📅 4 Jun
   Max is limping badly on left paw

💡 Keep important notes to share with your vet.
```

#### Test 4: Behavior Note (Indonesian)
**Send:**
```
Catat perilaku: Lebih aktif dari biasanya, bermain terus
```

**Expected Response:**
```
🐾 Catatan berhasil ditambahkan!

📝 Tingkat: Normal
📋 Jenis: Perilaku

💡 Catatan Anda tersimpan dan dapat dibagikan dengan dokter hewan saat diperlukan.
```

---

## 5. 🔔 Lost Pet Alert

### How It Works

**Technical Flow:**
1. User reports lost pet
2. `CommandParser` detects lost pet keywords
3. Extracts location from message
4. `LostPetHandler.reportLost()` creates alert
5. Saves to `lost_pet_alerts` table
6. Returns action recommendations

**Database Schema:**
```sql
lost_pet_alerts (
  id UUID,
  pet_id UUID,
  status TEXT (active|found|cancelled),
  last_seen_location TEXT,
  last_seen_at TIMESTAMP,
  found_at TIMESTAMP
)
```

### Test Scenarios

#### Test 1: Report Lost Pet
**Send:**
```
Lost near the park
```

**Expected Response:**
```
🚨 LOST PET ALERT ACTIVE

📍 Last seen: near the park
⏰ Time: Just now

💡 Recommended actions:
1. Search around your home area
2. Contact neighbors and friends
3. Post on local social media
4. Contact nearby animal shelters
5. Check microchip if available

🙏 We hope your pet is found soon!

Reply "Found" when your pet returns.
```

#### Test 2: Check Status
**Send:**
```
Lost pet status
```

**Expected Response:**
```
🚨 LOST PET STATUS

⏰ Missing for: 2 hours
📍 Last seen: near the park

💡 Keep searching and contact local shelters.

Reply "Found" when your pet returns.
```

#### Test 3: Mark as Found
**Send:**
```
Found
```

**Expected Response:**
```
🎉 PET FOUND!

Wonderful news! We're so happy your pet has returned safely.

💡 Post-return recommendations:
1. Check health condition
2. Provide water and food moderately
3. Check for injuries or wounds
4. Consider a vet visit
5. Update microchip info if needed

❤️ Take good care of your pet!
```

#### Test 4: Duplicate Alert Prevention
**Send (while alert is active):**
```
Lost at Main Street
```

**Expected Response:**
```
⚠️ There is already an active alert for this pet.

Use "Found" to update the status.
```

---

## 6. 🤖 AI Health Advice

### How It Works

**Technical Flow:**
1. User sends health question
2. `CommandParser` returns 'NONE' (not a feature command)
3. Falls through to AI processing
4. `IntentExtractor` analyzes message
5. Routes to appropriate engine:
   - `SymptomEngine` for symptoms
   - `FoodEngine` for food safety
   - `BehaviorEngine` for behavior
6. `ResponseGenerator` creates AI response
7. Logs event to `pet_events`

### Test Scenarios

#### Test 1: Symptom Analysis
**Send:**
```
My dog is vomiting and has diarrhea
```

**Expected Response:**
```
🏥 Symptom Analysis

Risk Level: MEDIUM ⚠️

Symptoms Detected:
• Vomiting
• Diarrhea

Assessment:
[AI-generated analysis of symptoms]

Recommendations:
• Monitor for 24 hours
• Ensure hydration
• Withhold food for 12 hours
• Contact vet if symptoms worsen

⚠️ Vet Visit: Recommended if symptoms persist beyond 24 hours

Follow-up: How long has this been happening?
```

#### Test 2: Food Safety
**Send:**
```
Can cats eat tuna?
```

**Expected Response:**
```
🍖 Food Safety Check

Food: Tuna
Pet: Cat
Safety: ✅ SAFE (with caution)

Analysis:
Tuna is generally safe for cats in moderation. However:
• Should not be the primary diet
• Too much can lead to mercury exposure
• Lacks essential nutrients cats need
• Can cause addiction

Recommendations:
• Offer as occasional treat only
• Use cat-specific tuna products
• Limit to 1-2 times per week
• Ensure balanced diet with cat food

💡 Tip: Fresh tuna is better than canned
```

#### Test 3: Behavior Issue
**Send:**
```
My puppy keeps biting everything
```

**Expected Response:**
```
🐾 Behavior Analysis

Behavior: Excessive biting/chewing
Risk Level: LOW ℹ️

Assessment:
This is normal puppy behavior, especially during teething (3-6 months). Puppies explore the world with their mouths.

Recommendations:
• Provide appropriate chew toys
• Redirect to toys when biting
• Use positive reinforcement
• Ensure adequate exercise
• Puppy-proof your home

Training Tips:
• Say "no" firmly when biting
• Immediately offer a toy
• Praise when chewing appropriate items
• Consider frozen toys for teething relief

⏰ Timeline: Usually improves by 6-8 months

Follow-up: How old is your puppy?
```

---

## 7. 💡 Help Menu

### Test Scenario

**Send:**
```
Help
```

**Expected Response:**
```
🐾 **PawPal Menu** 🐾

📋 **Available Features:**

⏰ **Smart Reminders**
• "Vaccine on January 15"
• "Deworming February 20"
• "List reminders"
• "Done" (mark reminder complete)

🍖 **Feeding Tracker**
• "Feeding schedule at 8 AM, portion 1 cup"
• "Fed chicken 200 grams"
• "Show feeding schedule"

🚽 **Potty Training**
• "Poop in correct spot"
• "Pee accident"
• "Potty stats"

📝 **Health Journal**
• "Note: Luna vomited this morning"
• "Note behavior: More active than usual"
• "List notes"

🔔 **Lost Pet Alert**
• "Lost near the park"
• "Found"
• "Lost pet status"

💡 **Tips:**
• Use natural language
• Include specific details
• Log consistently

Type health questions for AI consultation!
```

---

## 🧪 Complete Test Flow

### End-to-End User Journey

```
1. User: "Help"
   → Receives full menu

2. User: "Vaccine on June 15"
   → ✅ Reminder created

3. User: "List reminders"
   → Shows 1 reminder

4. User: "Feeding schedule at 8 AM, portion 1 cup"
   → ✅ Schedule created

5. User: "Fed kibble 1 cup"
   → ✅ Feeding logged

6. User: "Poop in correct spot"
   → ✅ Potty logged, stats updated

7. User: "Note: Max seems tired today"
   → ✅ Health note saved

8. User: "My dog is vomiting"
   → AI analysis with recommendations

9. User: "Potty stats"
   → Shows 100% success rate (1/1)

10. User: "Done"
    → ✅ Reminder marked complete
```

---

## 🔍 Verification Checklist

### Database Verification

After each test, verify in Supabase:

```sql
-- Check reminders
SELECT * FROM pet_reminders WHERE pet_id = 'your-pet-id';

-- Check feeding schedules
SELECT * FROM feeding_schedules WHERE pet_id = 'your-pet-id';

-- Check feeding logs
SELECT * FROM feeding_logs WHERE pet_id = 'your-pet-id';

-- Check potty logs
SELECT * FROM potty_training_logs WHERE pet_id = 'your-pet-id';

-- Check notes
SELECT * FROM pet_notes WHERE pet_id = 'your-pet-id';

-- Check lost pet alerts
SELECT * FROM lost_pet_alerts WHERE pet_id = 'your-pet-id';

-- Check conversations
SELECT * FROM conversations WHERE user_id = 'your-user-id' ORDER BY created_at DESC LIMIT 10;
```

### WhatsApp Webhook Logs

Check your terminal/logs for:
```
Received message from [phone]: [message]
Sent reply to [phone]
```

---

## 🐛 Troubleshooting

### Issue: No response from WhatsApp

**Check:**
1. Webhook is verified: `GET /api/whatsapp/webhook?hub.verify_token=...`
2. Environment variables are set
3. Server is running
4. WhatsApp number is correct

### Issue: Feature not recognized

**Check:**
1. Message contains feature keywords
2. CommandParser is working
3. Pet profile exists (required for most features)
4. Check terminal logs for parsing output

### Issue: Database not updating

**Check:**
1. Supabase connection
2. Database migrations applied
3. Repository methods working
4. Check error logs

---

## 📊 Success Metrics

After testing, you should have:

- ✅ At least 1 reminder created
- ✅ At least 1 feeding schedule
- ✅ At least 1 feeding log
- ✅ At least 1 potty log
- ✅ At least 1 health note
- ✅ Tested lost pet flow
- ✅ Received AI health advice
- ✅ All responses in correct language
- ✅ All data persisted in database

---

## 🚀 Next Steps

1. **Test Notifications:**
   - Wait for scheduled reminder time
   - Verify WhatsApp notification received
   - Test cron endpoint manually: `curl -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/cron/reminders`

2. **Test Edge Cases:**
   - Invalid dates
   - Missing required fields
   - Duplicate entries
   - Very long messages

3. **Performance Testing:**
   - Multiple rapid messages
   - Concurrent users
   - Large data sets

---

**Last Updated:** June 4, 2026
