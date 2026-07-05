#!/usr/bin/env bash

# ==============================================================================
# Smart View Receiver & Sender Ecosystem
# Enterprise Android APK Build Automation Script for Google Colab / Ubuntu
# ==============================================================================
# Description:
# This script automates the entire CI/CD pipeline for building the Smart View
# Android application from source. It installs necessary system dependencies
# (Node.js 20, Java 21, Android SDK), configures the environment, builds the
# React frontend, integrates Capacitor, resolves Gradle dependency conflicts,
# and compiles the final APK.
#
# Usage:
# 1. Clone the repository into Google Colab or your Ubuntu environment.
# 2. Run this script: `bash build_apk_colab.sh [PROJECT_PATH]`
#    If PROJECT_PATH is not provided, it defaults to /content/SmartView
# ==============================================================================

set -e
set -o pipefail

# ------------------------------------------------------------------------------
# Configuration & Environment Variables
# ------------------------------------------------------------------------------
export WORK_DIR="${1:-/content/SmartView}"
export OUTPUT_DIR="${WORK_DIR}/output"
export ANDROID_HOME="${WORK_DIR}/android-sdk"
export ANDROID_CMD_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip"
export NODE_VERSION="20.x"
export JAVA_VERSION="21"
export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
export ANDROID_API_LEVEL="34"
export BUILD_TOOLS_VERSION="34.0.0"

# Fix for container environments (like Google Colab) to prevent memory limit issues
export JAVA_TOOL_OPTIONS="-XX:-UseContainerSupport"
export _JAVA_OPTIONS="-XX:-UseContainerSupport"

# ------------------------------------------------------------------------------
# Logging Utilities
# ------------------------------------------------------------------------------
COLOR_RESET="\033[0m"
COLOR_INFO="\033[1;34m"
COLOR_SUCCESS="\033[1;32m"
COLOR_WARN="\033[1;33m"
COLOR_ERROR="\033[1;31m"

log_info()    { echo -e "${COLOR_INFO}[INFO] $(date +'%Y-%m-%d %H:%M:%S') - ${1}${COLOR_RESET}"; }
log_success() { echo -e "${COLOR_SUCCESS}[SUCCESS] $(date +'%Y-%m-%d %H:%M:%S') - ${1}${COLOR_RESET}"; }
log_warn()    { echo -e "${COLOR_WARN}[WARN] $(date +'%Y-%m-%d %H:%M:%S') - ${1}${COLOR_RESET}"; }
log_error()   { echo -e "${COLOR_ERROR}[ERROR] $(date +'%Y-%m-%d %H:%M:%S') - ${1}${COLOR_RESET}"; exit 1; }

# ------------------------------------------------------------------------------
# Phase 1: System Preparation
# ------------------------------------------------------------------------------
setup_system() {
    log_info "Phase 1: Updating system and installing base dependencies..."
    sudo apt-get update -qq || log_warn "apt-get update encountered issues, continuing..."
    sudo apt-get install -y -qq curl unzip wget git jq
    
    log_info "Installing OpenJDK ${JAVA_VERSION}..."
    sudo apt-get install -y -qq openjdk-${JAVA_VERSION}-jdk
    
    log_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y -qq nodejs
    
    log_success "System dependencies installed successfully."
    node -v
    npm -v
    java -version
}

# ------------------------------------------------------------------------------
# Phase 2: Android SDK & Toolchain Setup
# ------------------------------------------------------------------------------
setup_android_sdk() {
    log_info "Phase 2: Provisioning Android SDK and Command Line Tools..."
    
    if [ ! -d "$ANDROID_HOME" ]; then
        mkdir -p "${ANDROID_HOME}/cmdline-tools"
        
        cd /tmp
        log_info "Downloading Android Command Line Tools..."
        wget -q "${ANDROID_CMD_TOOLS_URL}" -O cmdtools.zip
        unzip -q cmdtools.zip -d "${ANDROID_HOME}/cmdline-tools"
        
        # Restructure for the new SDK manager format
        mv "${ANDROID_HOME}/cmdline-tools/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest"
    fi
    
    export PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin"
    
    log_info "Accepting Android SDK licenses..."
    set +o pipefail
    yes | sdkmanager --licenses > /dev/null 2>&1
    set -o pipefail
    
    log_info "Installing Android Platforms and Build Tools..."
    sdkmanager --update > /dev/null 2>&1
    sdkmanager "platform-tools" "platforms;android-${ANDROID_API_LEVEL}" "build-tools;${BUILD_TOOLS_VERSION}" > /dev/null
    
    export PATH="${PATH}:${ANDROID_HOME}/platform-tools"
    log_success "Android SDK provisioned successfully."
}

# ------------------------------------------------------------------------------
# Phase 3: Web Frontend Build
# ------------------------------------------------------------------------------
build_web_app() {
    log_info "Phase 3: Building React Web Application..."
    
    if [ ! -d "$WORK_DIR" ]; then
        log_error "Project directory not found at ${WORK_DIR}. Please pass the correct path or ensure the folder exists."
    fi

    cd "$WORK_DIR"
    
    if [ ! -f "package.json" ]; then
        log_error "package.json not found in ${WORK_DIR}. Make sure this is the correct project directory."
    fi
    
    log_info "Installing NPM dependencies..."
    npm install --silent
    
    log_info "Executing Web Build pipeline..."
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Web build failed. 'dist' directory not found."
    fi
    
    log_success "Web frontend compiled successfully."
}

# ------------------------------------------------------------------------------
# Phase 4: Capacitor Native Integration
# ------------------------------------------------------------------------------
integrate_capacitor() {
    log_info "Phase 4: Bootstrapping Capacitor Native Bridge..."
    cd "$WORK_DIR"
    
    log_info "Installing Capacitor dependencies..."
    npm install @capacitor/core @capacitor/android --silent
    npm install -D @capacitor/cli --silent
    
    log_info "Initializing Capacitor..."
    if [ ! -f "capacitor.config.ts" ] && [ ! -f "capacitor.config.json" ]; then
        npx cap init "Smart View" "com.smartview.app" --web-dir dist || log_warn "Capacitor init encountered a warning."
    else
        log_info "Capacitor config already exists, skipping init."
    fi
    
    log_info "Adding Android platform..."
    if [ ! -d "android" ]; then
        npx cap add android || log_warn "Android platform addition encountered a warning."
    else
        log_info "Android directory already exists, skipping add."
    fi
    
    log_info "Syncing web assets to native Android template..."
    npx cap sync android
    
    log_success "Capacitor integration complete."
}

# ------------------------------------------------------------------------------
# Phase 5: Patch Gradle Configurations (Resolving Duplicate Classes)
# ------------------------------------------------------------------------------
patch_gradle_configs() {
    log_info "Phase 5: Applying advanced Gradle fixes for dependency conflicts..."
    cd "${WORK_DIR}/android"
    
    # 1. Resolve Duplicate Classes (Kotlin stdlib conflicts)
    cat << 'GRADLE_EOF' >> build.gradle

// --- INJECTED BY AUTOMATED BUILD SCRIPT ---
subprojects {
    project.configurations.all {
        // Exclude older JDK specific Kotlin stdlib artifacts to avoid duplicate classes
        // since they are merged into kotlin-stdlib starting from version 1.8.0
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
        
        // Force specific versions if necessary
        resolutionStrategy.eachDependency { details ->
            if (details.requested.group == 'org.jetbrains.kotlin' && details.requested.name.startsWith('kotlin-stdlib')) {
                details.useVersion '1.8.22'
            }
        }
    }
}
// ------------------------------------------
GRADLE_EOF

    # 2. Fix variable declarations if variables.gradle exists (Capacitor default)
    if [ -f "variables.gradle" ]; then
        log_info "Updating variables.gradle to modern standards..."
        sed -i "s/kotlin_version = .*/kotlin_version = '1.8.22'/g" variables.gradle
    fi
    
    # 3. Suppress specific lint errors causing build failures
    cat << 'GRADLE_EOF' >> app/build.gradle

// --- INJECTED BY AUTOMATED BUILD SCRIPT ---
android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
}
// ------------------------------------------
GRADLE_EOF

    log_success "Gradle patching applied successfully."
}

# ------------------------------------------------------------------------------
# Phase 6: APK Compilation (Gradle)
# ------------------------------------------------------------------------------
compile_apk() {
    log_info "Phase 6: Compiling Android APK via Gradle..."
    cd "${WORK_DIR}/android"
    
    log_info "Making Gradle wrapper executable..."
    chmod +x gradlew
    
    log_info "Cleaning previous builds..."
    ./gradlew clean --no-daemon
    
    log_info "Executing Gradle assembleDebug..."
    ./gradlew assembleDebug --no-daemon --console=plain
    
    APK_SOURCE="${WORK_DIR}/android/app/build/outputs/apk/debug/app-debug.apk"
    if [ ! -f "$APK_SOURCE" ]; then
        log_error "APK generation failed. Target binary not found."
    fi
    
    mkdir -p "$OUTPUT_DIR"
    FINAL_APK="${OUTPUT_DIR}/SmartView_v1.0.0_debug.apk"
    cp "$APK_SOURCE" "$FINAL_APK"
    
    log_success "APK successfully compiled and exported to: ${FINAL_APK}"
}

# ------------------------------------------------------------------------------
# Main Execution Flow
# ------------------------------------------------------------------------------
main() {
    echo -e "${COLOR_INFO}"
    echo "============================================================"
    echo "  Smart View Enterprise Build Pipeline"
    echo "  Target Workspace: ${WORK_DIR}"
    echo "============================================================"
    echo -e "${COLOR_RESET}"
    
    # Record start time
    START_TIME=$(date +%s)
    
    setup_system
    setup_android_sdk
    build_web_app
    integrate_capacitor
    patch_gradle_configs
    compile_apk
    
    # Calculate duration
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo -e "${COLOR_SUCCESS}"
    echo "============================================================"
    echo "  Build Pipeline Completed Successfully!"
    echo "  Total Time: ${DURATION} seconds."
    echo "  APK Location: ${OUTPUT_DIR}/SmartView_v1.0.0_debug.apk"
    echo "============================================================"
    echo -e "${COLOR_RESET}"
}

# Execute main function
main
