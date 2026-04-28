#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_ROOMS 10
#define MAX_GUESTS 100
#define NAME_LEN 50

// Room types and rates
#define SINGLE_RATE  50.0
#define DOUBLE_RATE  80.0
#define SUITE_RATE  150.0

typedef struct {
    int    room_number;
    char   type[10];      // "Single", "Double", "Suite"
    int    is_occupied;
    double rate_per_night;
} Room;

typedef struct {
    int  guest_id;
    char name[NAME_LEN];
    char phone[20];
    int  room_number;
    int  check_in_day;   // simple day counter
    int  check_out_day;
    int  active;         // 1 = currently checked in
} Guest;

Room  rooms[MAX_ROOMS];
Guest guests[MAX_GUESTS];
int   guest_count = 0;
int   current_day = 1;  // simple simulated day

// ── Initialise rooms ─────────────────────────────────────────────────────────
void init_rooms() {
    const char *types[]  = {"Single","Single","Single","Double","Double",
                             "Double","Double","Suite","Suite","Suite"};
    double rates[] = {SINGLE_RATE,SINGLE_RATE,SINGLE_RATE,
                      DOUBLE_RATE,DOUBLE_RATE,DOUBLE_RATE,DOUBLE_RATE,
                      SUITE_RATE,SUITE_RATE,SUITE_RATE};
    for (int i = 0; i < MAX_ROOMS; i++) {
        rooms[i].room_number  = 101 + i;
        strcpy(rooms[i].type, types[i]);
        rooms[i].is_occupied  = 0;
        rooms[i].rate_per_night = rates[i];
    }
}

// ── Display all rooms ─────────────────────────────────────────────────────────
void display_rooms() {
    printf("\n╔══════════════════════════════════════════════════╗\n");
    printf("║              ROOM AVAILABILITY                  ║\n");
    printf("╠══════╦════════╦══════════╦═══════════════════════╣\n");
    printf("║ Room ║  Type  ║  Status  ║  Rate/Night           ║\n");
    printf("╠══════╬════════╬══════════╬═══════════════════════╣\n");
    for (int i = 0; i < MAX_ROOMS; i++) {
        printf("║ %4d ║ %-6s ║ %-8s ║  $%-20.2f║\n",
            rooms[i].room_number,
            rooms[i].type,
            rooms[i].is_occupied ? "Occupied" : "Free",
            rooms[i].rate_per_night);
    }
    printf("╚══════╩════════╩══════════╩═══════════════════════╝\n");
}

// ── Find room by number ───────────────────────────────────────────────────────
int find_room(int room_num) {
    for (int i = 0; i < MAX_ROOMS; i++)
        if (rooms[i].room_number == room_num) return i;
    return -1;
}

// ── Book a room ───────────────────────────────────────────────────────────────
void book_room() {
    display_rooms();
    int room_num;
    printf("\nEnter room number to book: ");
    scanf("%d", &room_num);

    int idx = find_room(room_num);
    if (idx == -1) { printf("Room not found.\n"); return; }
    if (rooms[idx].is_occupied) { printf("Room is already occupied.\n"); return; }

    Guest *g = &guests[guest_count];
    g->guest_id    = guest_count + 1;
    g->room_number = room_num;
    g->check_in_day = current_day;
    g->active      = 1;

    printf("Guest name  : "); scanf(" %[^\n]", g->name);
    printf("Phone number: "); scanf(" %[^\n]", g->phone);
    printf("Number of nights: ");
    int nights; scanf("%d", &nights);
    g->check_out_day = current_day + nights;

    rooms[idx].is_occupied = 1;
    guest_count++;

    printf("\n✔  Booking confirmed!\n");
    printf("   Guest ID   : %d\n", g->guest_id);
    printf("   Room       : %d (%s)\n", room_num, rooms[idx].type);
    printf("   Check-in   : Day %d\n", g->check_in_day);
    printf("   Check-out  : Day %d\n", g->check_out_day);
    printf("   Total est. : $%.2f\n", nights * rooms[idx].rate_per_night);
}

// ── Check out ─────────────────────────────────────────────────────────────────
void check_out() {
    int id;
    printf("\nEnter Guest ID to check out: ");
    scanf("%d", &id);

    for (int i = 0; i < guest_count; i++) {
        Guest *g = &guests[i];
        if (g->guest_id == id && g->active) {
            int   idx    = find_room(g->room_number);
            int   nights = current_day - g->check_in_day;
            if (nights <= 0) nights = 1;
            double bill  = nights * rooms[idx].rate_per_night;

            printf("\n╔═══════════════════════════════╗\n");
            printf("║          FINAL BILL           ║\n");
            printf("╠═══════════════════════════════╣\n");
            printf("║ Guest : %-21s║\n", g->name);
            printf("║ Room  : %-21d║\n", g->room_number);
            printf("║ Nights: %-21d║\n", nights);
            printf("║ Rate  : $%-20.2f║\n", rooms[idx].rate_per_night);
            printf("║ TOTAL : $%-20.2f║\n", bill);
            printf("╚═══════════════════════════════╝\n");

            rooms[idx].is_occupied = 0;
            g->active = 0;
            printf("✔  Check-out complete. Thank you, %s!\n", g->name);
            return;
        }
    }
    printf("Guest ID not found or already checked out.\n");
}

// ── Guest records ─────────────────────────────────────────────────────────────
void view_guests() {
    int found = 0;
    printf("\n╔══════╦══════════════════════╦═══════════╦══════╦══════════╗\n");
    printf("║  ID  ║ Name                 ║ Phone     ║ Room ║ Status   ║\n");
    printf("╠══════╬══════════════════════╬═══════════╬══════╬══════════╣\n");
    for (int i = 0; i < guest_count; i++) {
        Guest *g = &guests[i];
        printf("║ %4d ║ %-20s ║ %-9s ║ %4d ║ %-8s ║\n",
            g->guest_id, g->name, g->phone, g->room_number,
            g->active ? "Checked In" : "Checked Out");
        found = 1;
    }
    if (!found)
        printf("║          No guest records found.                        ║\n");
    printf("╚══════╩══════════════════════╩═══════════╩══════╩══════════╝\n");
}

// ── Advance day (simple simulation) ──────────────────────────────────────────
void advance_day() {
    current_day++;
    printf("Day advanced to Day %d.\n", current_day);
}

// ── Main menu ─────────────────────────────────────────────────────────────────
int main() {
    init_rooms();
    int choice;

    printf("\n  ╔══════════════════════════════╗");
    printf("\n  ║   WELCOME TO HOTEL MANAGER   ║");
    printf("\n  ╚══════════════════════════════╝\n");

    while (1) {
        printf("\n  Current Day: %d\n", current_day);
        printf("  ─────────────────────────\n");
        printf("  1. View Room Availability\n");
        printf("  2. Book a Room\n");
        printf("  3. Check Out Guest\n");
        printf("  4. View All Guests\n");
        printf("  5. Advance Day\n");
        printf("  6. Exit\n");
        printf("  ─────────────────────────\n");
        printf("  Choice: ");
        scanf("%d", &choice);

        switch (choice) {
            case 1: display_rooms(); break;
            case 2: book_room();     break;
            case 3: check_out();     break;
            case 4: view_guests();   break;
            case 5: advance_day();   break;
            case 6:
                printf("\nGoodbye! 👋\n");
                return 0;
            default:
                printf("Invalid option. Try again.\n");
        }
    }
}
