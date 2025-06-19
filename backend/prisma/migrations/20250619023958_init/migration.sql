-- CreateEnum
CREATE TYPE "ticket_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('open', 'in_progress', 'pending_requester_response', 'resolved', 'closed', 'awaiting_approval', 'approved', 'rejected', 'pending-approval', 'awaiting-changes', 'assigned', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "manager_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_id" INTEGER,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sub_category_id" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "item_id" INTEGER,
    "description" TEXT,

    CONSTRAINT "ticket_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" SERIAL NOT NULL,
    "template_id" INTEGER,
    "field_name" VARCHAR(255) NOT NULL,
    "field_label" VARCHAR(255),
    "field_type" VARCHAR(50) NOT NULL,
    "options" JSONB,
    "is_required" BOOLEAN DEFAULT false,
    "placeholder" TEXT,
    "default_value" TEXT,

    CONSTRAINT "custom_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ticket_status" NOT NULL DEFAULT 'open',
    "priority" "ticket_priority" NOT NULL DEFAULT 'medium',
    "created_by_user_id" INTEGER NOT NULL,
    "assigned_to_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(6),
    "sla_due_date" TIMESTAMPTZ(6),
    "item_id" INTEGER,
    "template_id" INTEGER,
    "manager_comments" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_type" VARCHAR(100),
    "uploaded_by_user_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_custom_field_values" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "field_definition_id" INTEGER NOT NULL,
    "value" TEXT,

    CONSTRAINT "ticket_custom_field_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_category_id_name_key" ON "sub_categories"("category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "items_sub_category_id_name_key" ON "items"("sub_category_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_templates_item_id_name_key" ON "ticket_templates"("item_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_template_id_field_name_key" ON "custom_field_definitions"("template_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_ticket_attachments_ticket_id" ON "ticket_attachments"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_custom_field_values_ticket_id_field_definition_id_key" ON "ticket_custom_field_values"("ticket_id", "field_definition_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_templates" ADD CONSTRAINT "ticket_templates_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "ticket_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "ticket_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_custom_field_values" ADD CONSTRAINT "ticket_custom_field_values_field_definition_id_fkey" FOREIGN KEY ("field_definition_id") REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_custom_field_values" ADD CONSTRAINT "ticket_custom_field_values_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
