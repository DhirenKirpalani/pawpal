#!/bin/bash

# PawPal Feature Testing Script
# Tests all features via webhook simulation

BASE_URL="http://localhost:3000"
WEBHOOK_URL="$BASE_URL/api/whatsapp/webhook"
PHONE="1234567890"

echo "🐾 PawPal Feature Testing"
echo "=========================="
echo ""

# Function to send test message
send_message() {
    local message="$1"
    local test_name="$2"
    
    echo "📤 Test: $test_name"
    echo "   Message: \"$message\""
    
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"object\": \"whatsapp_business_account\",
            \"entry\": [{
                \"id\": \"123\",
                \"changes\": [{
                    \"value\": {
                        \"messaging_product\": \"whatsapp\",
                        \"metadata\": {
                            \"display_phone_number\": \"1234567890\",
                            \"phone_number_id\": \"123456\"
                        },
                        \"contacts\": [{
                            \"profile\": {
                                \"name\": \"Test User\"
                            },
                            \"wa_id\": \"$PHONE\"
                        }],
                        \"messages\": [{
                            \"from\": \"$PHONE\",
                            \"id\": \"msg_$(date +%s)\",
                            \"timestamp\": \"$(date +%s)\",
                            \"text\": {
                                \"body\": \"$message\"
                            },
                            \"type\": \"text\"
                        }]
                    },
                    \"field\": \"messages\"
                }]
            }]
        }" \
        -s | jq -r '.status // "No response"'
    
    echo "   ✅ Sent"
    echo ""
    sleep 2
}

echo "Starting tests..."
echo ""

# Test 1: Help Menu
send_message "Help" "Help Menu"

# Test 2: Smart Reminders
send_message "Vaccine on December 25" "Add Vaccine Reminder"
send_message "List reminders" "List Reminders"

# Test 3: Feeding Tracker
send_message "Feeding schedule at 8 AM, portion 1 cup" "Add Feeding Schedule"
send_message "Fed chicken 200 grams" "Log Feeding"
send_message "Show feeding schedule" "View Feeding Schedule"

# Test 4: Potty Training
send_message "Poop in correct spot" "Log Potty Success"
send_message "Pee accident" "Log Potty Accident"
send_message "Potty stats" "View Potty Statistics"

# Test 5: Health Journal
send_message "Note: Max seems tired today" "Add Health Note"
send_message "List notes" "List Health Notes"

# Test 6: Lost Pet Alert
send_message "Lost near the park" "Report Lost Pet"
send_message "Lost pet status" "Check Lost Pet Status"
send_message "Found" "Mark Pet Found"

# Test 7: AI Health Advice
send_message "My dog is vomiting" "AI Symptom Analysis"
send_message "Can cats eat tuna?" "AI Food Safety"

# Test 8: Complete Reminder
send_message "Done" "Complete Reminder"

echo "=========================="
echo "✅ All tests completed!"
echo ""
echo "Check your terminal logs for responses"
echo "Check Supabase database for data"
