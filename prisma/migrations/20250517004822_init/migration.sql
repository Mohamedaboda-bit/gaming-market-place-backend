-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('admin', 'moderator', 'freelancer', 'client', 'support');

-- CreateEnum
CREATE TYPE "VerificationStatusEnum" AS ENUM ('pending', 'completed', 'rejected');

-- CreateEnum
CREATE TYPE "PaymentTypeEnum" AS ENUM ('escrow_fund', 'escrow_release', 'deposit', 'withdrawal', 'payout');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('credit_card', 'wallet', 'bank_transfer');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "EscrowStatusEnum" AS ENUM ('pending', 'funded', 'released', 'refunded');

-- CreateEnum
CREATE TYPE "ProjectTypeEnum" AS ENUM ('new_game', 'edit_game');

-- CreateEnum
CREATE TYPE "ProjectStatusEnum" AS ENUM ('pending', 'completed', 'rejected', 'assigned', 'canceled', 'withdrawned');

-- CreateEnum
CREATE TYPE "ProjectModeratorStatusEnum" AS ENUM ('active', 'removed');

-- CreateEnum
CREATE TYPE "ProposalStatusEnum" AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "PhaseNumberEnum" AS ENUM ('one', 'two', 'three', 'four');

-- CreateEnum
CREATE TYPE "ProjectFreelancerStatusEnum" AS ENUM ('applied', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "RatingEnum" AS ENUM ('one', 'two', 'three', 'four', 'five');

-- CreateEnum
CREATE TYPE "ConversationRoleEnum" AS ENUM ('client', 'freelancer', 'moderator');

-- CreateEnum
CREATE TYPE "WalletTransactionTypeEnum" AS ENUM ('deposit', 'withdrawal', 'escrow_fund', 'escrow_release', 'cancelation');

-- CreateEnum
CREATE TYPE "WalletDirectionEnum" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('proposal_accepted', 'proposal_rejected', 'new_message', 'escrow_funded', 'escrow_released', 'payment_received', 'project_assigned', 'verification_status', 'admin_message');

-- CreateEnum
CREATE TYPE "PaymentProviderEnum" AS ENUM ('stripe', 'paypal');

-- CreateEnum
CREATE TYPE "PaymentMethodStatusEnum" AS ENUM ('pending', 'rejected', 'accepted');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "remember_token" TEXT,
    "role" "RoleEnum" NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Freelancer_profile" (
    "id" BIGSERIAL NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "available" BOOLEAN NOT NULL,
    "location" TEXT,
    "website_url" TEXT,
    "experience_years" INTEGER,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "Freelancer_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gaming_engines" (
    "id" SERIAL NOT NULL,
    "engine_name" TEXT NOT NULL,

    CONSTRAINT "gaming_engines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_experienced_gaming_engines" (
    "freelancer_id" BIGINT NOT NULL,
    "engine_id" INTEGER NOT NULL,

    CONSTRAINT "freelancer_experienced_gaming_engines_pkey" PRIMARY KEY ("engine_id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_skill" (
    "freelancer_profile_id" BIGINT NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "freelancer_skill_pkey" PRIMARY KEY ("freelancer_profile_id","skill_id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" BIGSERIAL NOT NULL,
    "freelancer_profile_id" BIGINT NOT NULL,
    "platform" TEXT,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_verifications" (
    "id" BIGSERIAL NOT NULL,
    "verification_request_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_phone_verified" BOOLEAN NOT NULL,
    "selfie_image_url" TEXT,
    "document_image_url" TEXT,
    "is_document_verified" BOOLEAN NOT NULL,
    "verification_status" "VerificationStatusEnum" NOT NULL,
    "verification_completed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "user_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" BIGSERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "payer_id" BIGINT NOT NULL,
    "payee_id" BIGINT NOT NULL,
    "type" "PaymentTypeEnum" NOT NULL,
    "method" "PaymentMethodEnum" NOT NULL,
    "processed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(8,2),
    "platform_fee" DECIMAL(8,2),
    "transaction_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PaymentStatusEnum" NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_profile" (
    "id" BIGSERIAL NOT NULL,
    "company_name" TEXT,
    "website_url" TEXT,
    "about" TEXT,
    "avatar_url" TEXT,
    "location" TEXT,
    "user_id" BIGINT,

    CONSTRAINT "client_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrows" (
    "id" BIGSERIAL NOT NULL,
    "status" "EscrowStatusEnum" NOT NULL,
    "project_id" BIGINT NOT NULL,
    "amount" DECIMAL(8,2) NOT NULL,
    "freelancer_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "funded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "type" "ProjectTypeEnum" NOT NULL,
    "expected_duration" INTEGER NOT NULL,
    "status" "ProjectStatusEnum" NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_moderated" BOOLEAN NOT NULL,
    "client_id" BIGINT NOT NULL,
    "platform" TEXT NOT NULL,
    "number_of_phases" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_skills" (
    "skill_id" INTEGER NOT NULL,
    "project_id" BIGINT NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "project_game_engines" (
    "project_id" BIGINT NOT NULL,
    "game_engine_id" INTEGER NOT NULL,

    CONSTRAINT "project_game_engines_pkey" PRIMARY KEY ("game_engine_id")
);

-- CreateTable
CREATE TABLE "project_moderators" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "status" "ProjectModeratorStatusEnum" NOT NULL,
    "moderator_id" BIGINT NOT NULL,
    "assigned_by" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_moderators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" BIGSERIAL NOT NULL,
    "project_id" BIGINT NOT NULL,
    "status" "ProposalStatusEnum" NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated_days" INTEGER NOT NULL,
    "cover_letter" TEXT NOT NULL,
    "bid_amount" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "freelancer_id" BIGINT NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_timelines" (
    "id" BIGSERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_days" INTEGER NOT NULL,
    "proposal_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phase_number" "PhaseNumberEnum" NOT NULL,

    CONSTRAINT "proposal_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project_freelancer" (
    "id" BIGSERIAL NOT NULL,
    "status" "ProjectFreelancerStatusEnum" NOT NULL,
    "freelancer_id" BIGINT NOT NULL,
    "project_id" BIGINT NOT NULL,
    "proposal_id" BIGINT NOT NULL,
    "rating_by_client" "RatingEnum",
    "review_by_client" TEXT,
    "rated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "assigned_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_freelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelancer_stats" (
    "id" BIGSERIAL NOT NULL,
    "freelancer_id" BIGINT NOT NULL,
    "completed_projects_count" INTEGER DEFAULT 0,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_proposals_accepted" INTEGER NOT NULL DEFAULT 0,
    "total_reviews_count" INTEGER NOT NULL DEFAULT 0,
    "total_proposals_sent" INTEGER NOT NULL DEFAULT 0,
    "last_project_completed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freelancer_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "is_moderated" BOOLEAN NOT NULL DEFAULT false,
    "project_id" BIGINT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" BIGSERIAL NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_id" INTEGER NOT NULL,
    "role" "ConversationRoleEnum" NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" BIGSERIAL NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_id" INTEGER NOT NULL,
    "has_attachment" BOOLEAN NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachment" (
    "id" BIGSERIAL NOT NULL,
    "message_id" BIGINT NOT NULL,
    "attachment_url" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" BIGSERIAL NOT NULL,
    "wallet_id" BIGINT NOT NULL,
    "type" "WalletTransactionTypeEnum" NOT NULL,
    "direction" "WalletDirectionEnum" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "NotificationTypeEnum" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_payment_methods" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "provider" "PaymentProviderEnum" NOT NULL,
    "provider_customer_id" TEXT NOT NULL,
    "provider_payment_method_id" TEXT NOT NULL,
    "brand" TEXT,
    "last4" CHAR(4),
    "exp_month" INTEGER,
    "exp_year" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "PaymentMethodStatusEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_payment_methods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Freelancer_profile" ADD CONSTRAINT "Freelancer_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_experienced_gaming_engines" ADD CONSTRAINT "freelancer_experienced_gaming_engines_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_experienced_gaming_engines" ADD CONSTRAINT "freelancer_experienced_gaming_engines_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "gaming_engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_skill" ADD CONSTRAINT "freelancer_skill_freelancer_profile_id_fkey" FOREIGN KEY ("freelancer_profile_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_skill" ADD CONSTRAINT "freelancer_skill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_freelancer_profile_id_fkey" FOREIGN KEY ("freelancer_profile_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_profile" ADD CONSTRAINT "client_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_game_engines" ADD CONSTRAINT "project_game_engines_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_game_engines" ADD CONSTRAINT "project_game_engines_game_engine_id_fkey" FOREIGN KEY ("game_engine_id") REFERENCES "gaming_engines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_moderators" ADD CONSTRAINT "project_moderators_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_moderators" ADD CONSTRAINT "project_moderators_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_timelines" ADD CONSTRAINT "proposal_timelines_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_freelancer" ADD CONSTRAINT "Project_freelancer_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_freelancer" ADD CONSTRAINT "Project_freelancer_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project_freelancer" ADD CONSTRAINT "Project_freelancer_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelancer_stats" ADD CONSTRAINT "freelancer_stats_freelancer_id_fkey" FOREIGN KEY ("freelancer_id") REFERENCES "Freelancer_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
