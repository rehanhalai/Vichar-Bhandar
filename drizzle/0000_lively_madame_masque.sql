CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#888888',
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `drafts` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text,
	`category_id` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`thought_id` text NOT NULL,
	`label` text NOT NULL,
	FOREIGN KEY (`thought_id`) REFERENCES `thoughts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `thoughts` (
	`id` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`category_id` text,
	`mood` integer,
	`is_pinned` integer DEFAULT 0,
	`date` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)),
	`updated_at` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
