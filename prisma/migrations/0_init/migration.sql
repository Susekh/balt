-- CreateTable
CREATE TABLE `PendingUser` (
    `Email` VARCHAR(200) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `start_time` FLOAT NOT NULL,
    `end_time` FLOAT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `batch_exam` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchid` INTEGER NOT NULL,
    `examid` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `entry_date` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `elixirla` (
    `email` VARCHAR(250) NOT NULL,
    `stname` VARCHAR(250) NOT NULL,
    `phone` VARCHAR(12) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `gname` VARCHAR(250) NOT NULL,
    `gphone` VARCHAR(12) NOT NULL,
    `gemail` VARCHAR(250) NOT NULL,
    `stclass` VARCHAR(25) NOT NULL,
    `stdisc` VARCHAR(25) NOT NULL,
    `password` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `elixirlb` (
    `email` VARCHAR(250) NOT NULL,
    `stname` VARCHAR(250) NOT NULL,
    `phone` VARCHAR(12) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `gname` VARCHAR(250) NOT NULL,
    `gphone` VARCHAR(12) NOT NULL,
    `gemail` VARCHAR(250) NOT NULL,
    `stclass` VARCHAR(25) NOT NULL,
    `stdisc` VARCHAR(25) NOT NULL,
    `password` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_download` (
    `uid` INTEGER NOT NULL,
    `downloadtime` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `uploadtime` DATETIME(0) NULL,
    `id_exam` INTEGER NULL,

    INDEX `id_exam`(`id_exam`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `mark` FLOAT NOT NULL,
    `rank` INTEGER NOT NULL,
    `percent` FLOAT NOT NULL,
    `correct_ans` INTEGER NOT NULL,
    `wrong_ans` INTEGER NOT NULL,
    `not_answered` INTEGER NOT NULL,
    `max_mark` FLOAT NOT NULL,
    `qns_no` INTEGER NOT NULL,
    `attempted_no` INTEGER NOT NULL,
    `correct_no` INTEGER NOT NULL,
    `wrong_no` INTEGER NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_user`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NULL,
    `id_section` INTEGER NULL,
    `qns_no` INTEGER NULL,
    `max_time` FLOAT NULL,
    `assignquestion_status` INTEGER NULL,
    `assignlabel_status` INTEGER NOT NULL DEFAULT 0,
    `appear_order` INTEGER NULL,

    INDEX `id_exam`(`id_exam`, `id_section`),
    INDEX `id_section`(`id_section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `id_section` INTEGER NOT NULL,
    `id_question` INTEGER NOT NULL,
    `question_no` INTEGER NOT NULL,
    `id_answer` VARCHAR(3000) NOT NULL,
    `status` INTEGER NOT NULL,
    `ans_status` INTEGER NOT NULL,
    `mark` FLOAT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_user`, `id_section`, `id_question`, `id_answer`),
    INDEX `id_question`(`id_question`),
    INDEX `id_section`(`id_section`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `id_exam` INTEGER NOT NULL,
    `attend_status` INTEGER NOT NULL,
    `pending_status` INTEGER NOT NULL DEFAULT 1,

    INDEX `id_exam`(`id_exam`),
    INDEX `id_user`(`id_user`, `id_exam`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_parent` INTEGER NULL,
    `name` VARCHAR(50) NOT NULL,
    `parent_name` VARCHAR(100) NULL,
    `description` TEXT NOT NULL,
    `published` INTEGER NULL,
    `type` INTEGER NULL,
    `access_id` INTEGER NULL,
    `notify_msg` TEXT NOT NULL,
    `publish_date` DATE NOT NULL,
    `unpublish_date` DATE NOT NULL,
    `sectionassign_status` INTEGER NULL,
    `userassign_status` INTEGER NULL,
    `transferable` INTEGER NULL,
    `max_time` FLOAT NULL,
    `qns_no` INTEGER NULL,
    `sec_no` INTEGER NULL,
    `sec_time` FLOAT NULL,
    `allow` INTEGER NULL,
    `result` INTEGER NULL,
    `report_filter` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `examsection_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_examsection` INTEGER NOT NULL,
    `id_question` INTEGER NOT NULL,
    `assignquestion_status` INTEGER NOT NULL,
    `appear_order` INTEGER NOT NULL,

    INDEX `id_exam`(`id_exam`, `id_examsection`, `id_question`),
    INDEX `id_examsection`(`id_examsection`),
    INDEX `id_question`(`id_question`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `online_user` (
    `uid` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(30) NULL,
    `last_name` VARCHAR(50) NULL,
    `username` VARCHAR(100) NULL,
    `password` VARCHAR(300) NULL,
    `user_password` VARCHAR(150) NULL,
    `batch` INTEGER NULL,
    `origin_batch` VARCHAR(150) NULL,
    `semester` INTEGER NOT NULL,
    `email` VARCHAR(50) NULL,
    `contact_no` VARCHAR(30) NULL,
    `parent_contact_no` VARCHAR(30) NULL,
    `dob` VARCHAR(30) NULL,
    `login_status` INTEGER NULL,
    `type` VARCHAR(30) NULL,
    `id_exam` INTEGER NULL,
    `mobile_number` VARCHAR(30) NULL,
    `address` VARCHAR(200) NULL,
    `caption_image` VARCHAR(200) NULL,
    `exam_counter` INTEGER NULL,
    `city` VARCHAR(150) NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `dist` VARCHAR(150) NULL,
    `state` VARCHAR(150) NULL,
    `pin_code` VARCHAR(150) NULL,
    `status` INTEGER NULL,
    `mode` INTEGER NOT NULL DEFAULT 1,

    INDEX `id_exam`(`id_exam`),
    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `origin_batch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `start_time` FLOAT NOT NULL,
    `end_time` FLOAT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `osbicla` (
    `email` VARCHAR(250) NOT NULL,
    `stname` VARCHAR(250) NOT NULL,
    `phone` VARCHAR(12) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `gname` VARCHAR(250) NOT NULL,
    `gphone` VARCHAR(12) NOT NULL,
    `gemail` VARCHAR(250) NOT NULL,
    `stclass` VARCHAR(25) NOT NULL,
    `stdisc` VARCHAR(25) NOT NULL,
    `password` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `osbiclb` (
    `email` VARCHAR(250) NOT NULL,
    `stname` VARCHAR(250) NOT NULL,
    `phone` VARCHAR(12) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `gname` VARCHAR(250) NOT NULL,
    `gphone` VARCHAR(12) NOT NULL,
    `gemail` VARCHAR(250) NOT NULL,
    `stclass` VARCHAR(25) NOT NULL,
    `stdisc` VARCHAR(25) NOT NULL,
    `password` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `other_candidates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) NOT NULL,
    `password` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `propositions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer` TEXT NOT NULL,
    `correct` TINYINT NOT NULL,
    `id_question` INTEGER NOT NULL,

    INDEX `id_question`(`id_question`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_compile` (
    `id_question` INTEGER NOT NULL,
    `sample_input` VARCHAR(500) NOT NULL,
    `sample_output` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id_question`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_label` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NULL,
    `id_section` INTEGER NULL,
    `id_examsection` INTEGER NULL,
    `id_category` INTEGER NULL,
    `qns_no` INTEGER NULL,

    INDEX `id_category`(`id_category`),
    INDEX `id_exam`(`id_exam`, `id_section`, `id_examsection`, `id_category`),
    INDEX `id_examsection`(`id_examsection`),
    INDEX `id_section`(`id_section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` TEXT NOT NULL,
    `id_section` INTEGER NOT NULL,
    `id_category` INTEGER NOT NULL,
    `positive_mark` FLOAT NOT NULL,
    `negative_mark` FLOAT NOT NULL,
    `options` INTEGER NOT NULL,
    `qtype` INTEGER NULL,

    INDEX `id_category`(`id_category`),
    INDEX `id_section`(`id_section`, `id_category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions_type` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(25) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `random_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_question` INTEGER NOT NULL,

    INDEX `id_exam`(`id_exam`, `id_question`),
    INDEX `id_question`(`id_question`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `random_sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_section` INTEGER NOT NULL,
    `qns_no` INTEGER NOT NULL,

    INDEX `id_exam`(`id_exam`, `id_section`),
    INDEX `id_section`(`id_section`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `section_record` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_section` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `mark` DOUBLE NOT NULL,
    `rank` INTEGER NOT NULL,
    `percent` FLOAT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_section`, `id_user`),
    INDEX `id_section`(`id_section`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` VARCHAR(100) NOT NULL,
    `entry_date` DATE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semester` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `semester` VARCHAR(256) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stype` (
    `status` VARCHAR(15) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temp_examquestions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NULL,
    `id_user` INTEGER NULL,
    `id_section` INTEGER NULL,
    `id_question` VARCHAR(10) NULL,
    `question_no` INTEGER NULL,
    `entry_time` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_user`, `id_section`, `id_question`),
    INDEX `id_section`(`id_section`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temp_examreport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `numbers` TEXT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_user`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_exam` INTEGER NOT NULL,
    `id_section` INTEGER NOT NULL,
    `id_question` INTEGER NOT NULL,
    `question_no` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `halt_time` FLOAT NOT NULL,
    `entry_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `id_exam`(`id_exam`, `id_section`, `id_question`, `id_user`),
    INDEX `id_question`(`id_question`),
    INDEX `id_section`(`id_section`),
    INDEX `id_user`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tmq` (
    `email` VARCHAR(250) NOT NULL,
    `stname` VARCHAR(250) NOT NULL,
    `phone` VARCHAR(12) NOT NULL,
    `gender` VARCHAR(8) NOT NULL,
    `gname` VARCHAR(250) NOT NULL,
    `gphone` VARCHAR(12) NOT NULL,
    `gemail` VARCHAR(250) NOT NULL,
    `stclass` VARCHAR(25) NOT NULL,
    `stdisc` VARCHAR(25) NOT NULL,
    `password` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `uid` INTEGER NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(20) NOT NULL,
    `pass` VARCHAR(100) NOT NULL,
    `name` VARCHAR(20) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `type` INTEGER NOT NULL,
    `login_status` INTEGER NOT NULL,

    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `email_id` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exam_download` ADD CONSTRAINT `exam_download_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record` ADD CONSTRAINT `exam_record_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record` ADD CONSTRAINT `exam_record_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sections` ADD CONSTRAINT `exam_sections_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sections` ADD CONSTRAINT `exam_sections_ibfk_2` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sessions` ADD CONSTRAINT `exam_sessions_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sessions` ADD CONSTRAINT `exam_sessions_ibfk_2` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sessions` ADD CONSTRAINT `exam_sessions_ibfk_3` FOREIGN KEY (`id_section`) REFERENCES `exam_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_sessions` ADD CONSTRAINT `exam_sessions_ibfk_4` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_users` ADD CONSTRAINT `exam_users_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_users` ADD CONSTRAINT `exam_users_ibfk_2` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `examsection_questions` ADD CONSTRAINT `examsection_questions_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `examsection_questions` ADD CONSTRAINT `examsection_questions_ibfk_2` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `examsection_questions` ADD CONSTRAINT `examsection_questions_ibfk_3` FOREIGN KEY (`id_examsection`) REFERENCES `exam_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `online_user` ADD CONSTRAINT `online_user_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `propositions` ADD CONSTRAINT `propositions_ibfk_1` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_compile` ADD CONSTRAINT `question_compile_ibfk_1` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_label` ADD CONSTRAINT `question_label_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_label` ADD CONSTRAINT `question_label_ibfk_2` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_label` ADD CONSTRAINT `question_label_ibfk_3` FOREIGN KEY (`id_examsection`) REFERENCES `exam_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_label` ADD CONSTRAINT `question_label_ibfk_4` FOREIGN KEY (`id_category`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`id_category`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `random_questions` ADD CONSTRAINT `random_questions_ibfk_1` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `random_questions` ADD CONSTRAINT `random_questions_ibfk_2` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `random_sections` ADD CONSTRAINT `random_sections_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `random_sections` ADD CONSTRAINT `random_sections_ibfk_2` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_record` ADD CONSTRAINT `section_record_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_record` ADD CONSTRAINT `section_record_ibfk_2` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `section_record` ADD CONSTRAINT `section_record_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temp_examquestions` ADD CONSTRAINT `temp_examquestions_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temp_examquestions` ADD CONSTRAINT `temp_examquestions_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temp_examquestions` ADD CONSTRAINT `temp_examquestions_ibfk_3` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temp_examreport` ADD CONSTRAINT `temp_examreport_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `temp_examreport` ADD CONSTRAINT `temp_examreport_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_status` ADD CONSTRAINT `time_status_ibfk_1` FOREIGN KEY (`id_exam`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_status` ADD CONSTRAINT `time_status_ibfk_2` FOREIGN KEY (`id_section`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_status` ADD CONSTRAINT `time_status_ibfk_3` FOREIGN KEY (`id_question`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_status` ADD CONSTRAINT `time_status_ibfk_4` FOREIGN KEY (`id_user`) REFERENCES `online_user`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;

