CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"game" text NOT NULL,
	"course_type" text NOT NULL,
	"image_url" text,
	"instructor_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"author_id" integer NOT NULL,
	"publish_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"rental_id" integer,
	"custom_request" text,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"total_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"item_type" text NOT NULL,
	"rarity" text NOT NULL,
	"game" text NOT NULL,
	"price_per_day" integer NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "streamer_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"streamer_id" integer NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"game" text,
	"title" text,
	"notes" text,
	"is_special_event" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streamers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" text NOT NULL,
	"twitch_id" text NOT NULL,
	"profile_image_url" text,
	"is_live" boolean DEFAULT false NOT NULL,
	"current_game" text,
	"stream_title" text,
	"viewer_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"display_name" text,
	"bio" text,
	"avatar" text,
	"discord_username" text,
	"twitter_username" text,
	"game_ids" text[],
	"preferences" jsonb DEFAULT '{"emailNotifications":true,"showWalletAddress":false,"darkMode":true}'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"date_of_birth" text NOT NULL,
	"guild" text NOT NULL,
	"discord_username" text,
	"twitch_handle" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
