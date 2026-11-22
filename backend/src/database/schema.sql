-- =====================================================
-- SECURE IoT SMART HOME NETWORK — DATABASE SCHEMA
-- MySQL 8.0
-- =====================================================

CREATE DATABASE IF NOT EXISTS secure_iot_smarthome
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE secure_iot_smarthome;

-- ---------- 1. USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  email         VARCHAR(128) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','analyst','viewer') NOT NULL DEFAULT 'viewer',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- 2. IOT_DEVICES ----------
CREATE TABLE IF NOT EXISTS iot_devices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  device_uid     VARCHAR(64)  NOT NULL UNIQUE,
  name           VARCHAR(128) NOT NULL,
  device_type    ENUM('cctv','smart_lock','temperature_sensor','motion_sensor','smart_light','router','switch','gateway','home_server') NOT NULL,
  ip_address     VARCHAR(45)  NOT NULL,
  mac_address    VARCHAR(17)  NOT NULL,
  room           VARCHAR(64)  NULL,
  firmware       VARCHAR(64)  NULL,
  status         ENUM('online','offline','warning','error') NOT NULL DEFAULT 'offline',
  is_encrypted   TINYINT(1) NOT NULL DEFAULT 1,
  last_seen_at   DATETIME NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_iot_status (status),
  INDEX idx_iot_type (device_type)
) ENGINE=InnoDB;

-- ---------- 3. NETWORK_NODES ----------
CREATE TABLE IF NOT EXISTS network_nodes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  node_uid      VARCHAR(64) NOT NULL UNIQUE,
  label         VARCHAR(128) NOT NULL,
  node_type     ENUM('device','router','switch','gateway','server') NOT NULL,
  ip_address    VARCHAR(45) NOT NULL,
  position_x    FLOAT NOT NULL DEFAULT 0,
  position_y    FLOAT NOT NULL DEFAULT 0,
  position_z    FLOAT NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  device_id     INT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_node_device FOREIGN KEY (device_id) REFERENCES iot_devices(id) ON DELETE SET NULL,
  INDEX idx_node_type (node_type)
) ENGINE=InnoDB;

-- ---------- 4. NETWORK_CONNECTIONS ----------
CREATE TABLE IF NOT EXISTS network_connections (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  connection_uid VARCHAR(64) NOT NULL UNIQUE,
  source_node_id INT NOT NULL,
  target_node_id INT NOT NULL,
  link_cost      INT NOT NULL DEFAULT 1,
  bandwidth_mbps INT NOT NULL DEFAULT 100,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_conn_src FOREIGN KEY (source_node_id) REFERENCES network_nodes(id) ON DELETE CASCADE,
  CONSTRAINT fk_conn_tgt FOREIGN KEY (target_node_id) REFERENCES network_nodes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_conn_pair (source_node_id, target_node_id)
) ENGINE=InnoDB;

-- ---------- 5. SIMULATION_SESSIONS ----------
CREATE TABLE IF NOT EXISTS simulation_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_uid   VARCHAR(64) NOT NULL UNIQUE,
  user_id       INT NULL,
  name          VARCHAR(128) NOT NULL,
  status        ENUM('running','paused','stopped','completed') NOT NULL DEFAULT 'running',
  config_json   JSON NULL,
  started_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at      DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 6. PACKETS ----------
CREATE TABLE IF NOT EXISTS packets (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id       INT NULL,
  packet_uid       VARCHAR(64) NOT NULL UNIQUE,
  packet_number    BIGINT NOT NULL,
  source_ip        VARCHAR(45) NOT NULL,
  destination_ip   VARCHAR(45) NOT NULL,
  source_device_id INT NULL,
  target_device_id INT NULL,
  protocol         ENUM('TCP','UDP','MQTT','HTTP','DNS','ICMP') NOT NULL,
  length_bytes     INT NOT NULL,
  status           ENUM('ok','encrypted','corrupted','dropped','retransmitted') NOT NULL DEFAULT 'ok',
  is_encrypted     TINYINT(1) NOT NULL DEFAULT 0,
  captured_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_pkt_session FOREIGN KEY (session_id) REFERENCES simulation_sessions(id) ON DELETE SET NULL,
  CONSTRAINT fk_pkt_src FOREIGN KEY (source_device_id) REFERENCES iot_devices(id) ON DELETE SET NULL,
  CONSTRAINT fk_pkt_tgt FOREIGN KEY (target_device_id) REFERENCES iot_devices(id) ON DELETE SET NULL,
  INDEX idx_pkt_proto (protocol),
  INDEX idx_pkt_status (status),
  INDEX idx_pkt_time (captured_at)
) ENGINE=InnoDB;

-- ---------- 7. PACKET_FRAMES ----------
CREATE TABLE IF NOT EXISTS packet_frames (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  frame_uid       VARCHAR(64) NOT NULL UNIQUE,
  packet_id       BIGINT NOT NULL,
  sequence_number INT NOT NULL,
  source_address  VARCHAR(45) NOT NULL,
  dest_address    VARCHAR(45) NOT NULL,
  payload_hex     TEXT NOT NULL,
  crc_value       VARCHAR(16) NOT NULL,
  start_delimiter VARCHAR(8) NOT NULL DEFAULT '0x7E',
  end_delimiter   VARCHAR(8) NOT NULL DEFAULT '0x7F',
  is_valid        TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_frame_packet FOREIGN KEY (packet_id) REFERENCES packets(id) ON DELETE CASCADE,
  INDEX idx_frame_packet (packet_id)
) ENGINE=InnoDB;

-- ---------- 8. ENCRYPTION_LOGS ----------
CREATE TABLE IF NOT EXISTS encryption_logs (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_uid         VARCHAR(64) NOT NULL UNIQUE,
  packet_id       BIGINT NULL,
  operation       ENUM('encrypt','decrypt','keygen','verify_fail','verify_ok') NOT NULL,
  algorithm       VARCHAR(32) NOT NULL DEFAULT 'AES-256-GCM',
  iv_b64          VARCHAR(64) NULL,
  tag_b64         VARCHAR(64) NULL,
  ciphertext_len  INT NULL,
  plaintext_len   INT NULL,
  success         TINYINT(1) NOT NULL DEFAULT 1,
  error_message   VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enc_packet FOREIGN KEY (packet_id) REFERENCES packets(id) ON DELETE SET NULL,
  INDEX idx_enc_operation (operation)
) ENGINE=InnoDB;

-- ---------- 9. CRC_LOGS ----------
CREATE TABLE IF NOT EXISTS crc_logs (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_uid       VARCHAR(64) NOT NULL UNIQUE,
  frame_id      BIGINT NULL,
  algorithm     ENUM('CRC-16','CRC-32') NOT NULL DEFAULT 'CRC-16',
  expected_crc  VARCHAR(16) NOT NULL,
  computed_crc  VARCHAR(16) NOT NULL,
  is_match      TINYINT(1) NOT NULL,
  corrupted     TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_crc_frame FOREIGN KEY (frame_id) REFERENCES packet_frames(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 10. TRANSMISSION_LOGS ----------
CREATE TABLE IF NOT EXISTS transmission_logs (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_uid         VARCHAR(64) NOT NULL UNIQUE,
  session_id      INT NULL,
  frame_id        BIGINT NULL,
  event_type      ENUM('sent','received','timeout','dropped','ack_sent','ack_received') NOT NULL,
  window_size     INT NULL,
  base_seq        INT NULL,
  next_seq        INT NULL,
  message         VARCHAR(255) NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_session FOREIGN KEY (session_id) REFERENCES simulation_sessions(id) ON DELETE SET NULL,
  CONSTRAINT fk_tx_frame FOREIGN KEY (frame_id) REFERENCES packet_frames(id) ON DELETE SET NULL,
  INDEX idx_tx_event (event_type)
) ENGINE=InnoDB;

-- ---------- 11. ACKNOWLEDGEMENTS ----------
CREATE TABLE IF NOT EXISTS acknowledgements (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  ack_uid         VARCHAR(64) NOT NULL UNIQUE,
  session_id      INT NULL,
  ack_number      INT NOT NULL,
  is_cumulative   TINYINT(1) NOT NULL DEFAULT 1,
  received_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ack_session FOREIGN KEY (session_id) REFERENCES simulation_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 12. RETRANSMISSION_LOGS ----------
CREATE TABLE IF NOT EXISTS retransmission_logs (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_uid           VARCHAR(64) NOT NULL UNIQUE,
  session_id        INT NULL,
  original_seq      INT NOT NULL,
  retransmit_count  INT NOT NULL DEFAULT 1,
  reason            ENUM('timeout','nack','corruption') NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rtx_session FOREIGN KEY (session_id) REFERENCES simulation_sessions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------- 13. ROUTING_TABLES ----------
CREATE TABLE IF NOT EXISTS routing_tables (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  log_uid       VARCHAR(64) NOT NULL UNIQUE,
  session_id    INT NULL,
  algorithm     ENUM('distance_vector','link_state') NOT NULL,
  node_id       INT NOT NULL,
  destination   VARCHAR(45) NOT NULL,
  next_hop      VARCHAR(45) NOT NULL,
  cost          INT NOT NULL,
  path_json     JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rout_session FOREIGN KEY (session_id) REFERENCES simulation_sessions(id) ON DELETE SET NULL,
  CONSTRAINT fk_rout_node FOREIGN KEY (node_id) REFERENCES network_nodes(id) ON DELETE CASCADE,
  INDEX idx_rout_node (node_id)
) ENGINE=InnoDB;

-- ---------- 14. NETWORK_SCANS ----------
CREATE TABLE IF NOT EXISTS network_scans (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  scan_uid        VARCHAR(64) NOT NULL UNIQUE,
  scan_type       ENUM('host_discovery','port_scan','service_detect','os_fingerprint') NOT NULL,
  target_cidr     VARCHAR(32) NOT NULL,
  results_json    JSON NOT NULL,
  hosts_found     INT NOT NULL DEFAULT 0,
  duration_ms     INT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------- 15. SECURITY_EVENTS ----------
CREATE TABLE IF NOT EXISTS security_events (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  event_uid     VARCHAR(64) NOT NULL UNIQUE,
  event_type    ENUM('unauthorized_connection','failed_auth','corrupted_packet','device_offline','suspicious_traffic','encryption_failure','scan_detected') NOT NULL,
  severity      ENUM('low','medium','high','critical') NOT NULL DEFAULT 'low',
  source_ip     VARCHAR(45) NULL,
  target_ip     VARCHAR(45) NULL,
  device_id     INT NULL,
  description   VARCHAR(255) NOT NULL,
  resolved      TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sec_device FOREIGN KEY (device_id) REFERENCES iot_devices(id) ON DELETE SET NULL,
  INDEX idx_sec_severity (severity),
  INDEX idx_sec_created (created_at)
) ENGINE=InnoDB;