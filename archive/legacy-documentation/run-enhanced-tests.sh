#!/bin/bash

# Enhanced BSG Testing Suite Runner
# Comprehensive automation for name field and workflow testing

echo "🚀 Enhanced BSG Testing Suite"
echo "=============================="
echo ""

# Configuration
TEST_TYPE=${1:-"full"}
BROWSER=${2:-"chromium"}
HEADLESS=${3:-"false"}

echo "Configuration:"
echo "  Test Type: $TEST_TYPE"
echo "  Browser: $BROWSER"
echo "  Headless: $HEADLESS"
echo ""

# Function to check if services are running
check_services() {
    echo "🔍 Checking required services..."
    
    # Check backend
    if curl -s http://localhost:3001 > /dev/null; then
        echo "✅ Backend service is running"
    else
        echo "❌ Backend service is not accessible"
        echo "   Please start with: npm run dev:backend"
        exit 1
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend service is running"
    else
        echo "❌ Frontend service is not accessible"
        echo "   Please start with: npm run dev:frontend"
        exit 1
    fi
    
    echo ""
}

# Function to run API tests first
run_api_tests() {
    echo "🧪 Running API-level name field tests..."
    
    # Run simple name field integration test
    echo "  → Simple name field integration test"
    if node test-name-field-simple.js; then
        echo "  ✅ API tests passed"
    else
        echo "  ❌ API tests failed"
        echo "  Continuing with browser tests..."
    fi
    echo ""
}

# Function to prepare test data
prepare_test_data() {
    echo "📊 Preparing test data..."
    
    # Create test datasets
    echo "  → Creating test users with name field support"
    if node test-data-manager.js create; then
        echo "  ✅ Test data prepared"
    else
        echo "  ❌ Test data preparation failed"
        echo "  Continuing with existing data..."
    fi
    echo ""
}

# Function to run Playwright tests
run_playwright_tests() {
    echo "🎭 Running Playwright browser automation tests..."
    
    local project_filter=""
    case $BROWSER in
        "chromium"|"chrome")
            project_filter="--project=chromium-desktop"
            ;;
        "firefox")
            project_filter="--project=firefox-desktop"
            ;;
        "webkit"|"safari")
            project_filter="--project=webkit-desktop"
            ;;
        "mobile")
            project_filter="--project=mobile-chrome"
            ;;
        "tablet")
            project_filter="--project=tablet-chrome"
            ;;
        "all")
            project_filter=""
            ;;
    esac
    
    local test_filter=""
    case $TEST_TYPE in
        "namefield"|"name")
            test_filter="--grep='Name Field'"
            ;;
        "workflow")
            test_filter="--grep='Workflow'"
            ;;
        "it")
            test_filter="--grep='IT Ticket'"
            ;;
        "kasda")
            test_filter="--grep='KASDA'"
            ;;
        "comparison"|"compare")
            test_filter="--grep='Comparison'"
            ;;
        "cross-browser"|"browser")
            test_filter="--grep='Cross-Browser'"
            ;;
        "full"|"all")
            test_filter=""
            ;;
    esac
    
    # Build Playwright command
    local playwright_cmd="npx playwright test --config=playwright.enhanced-bsg.config.js"
    
    if [ "$HEADLESS" = "true" ]; then
        playwright_cmd="$playwright_cmd --headed=false"
    else
        playwright_cmd="$playwright_cmd --headed=true"
    fi
    
    if [ -n "$project_filter" ]; then
        playwright_cmd="$playwright_cmd $project_filter"
    fi
    
    if [ -n "$test_filter" ]; then
        playwright_cmd="$playwright_cmd $test_filter"
    fi
    
    echo "  → Running: $playwright_cmd"
    echo ""
    
    # Execute Playwright tests
    if eval $playwright_cmd; then
        echo ""
        echo "✅ Playwright tests completed successfully"
    else
        echo ""
        echo "❌ Playwright tests encountered issues"
        echo "   Check test-results/ directory for detailed reports"
    fi
}

# Function to generate final report
generate_final_report() {
    echo ""
    echo "📈 Generating final test report..."
    
    # Generate test data report
    node test-data-manager.js report > test-results/data-manager-report.txt 2>&1
    
    # Create summary
    echo "🎯 Enhanced BSG Testing Summary" > test-results/final-summary.txt
    echo "===============================" >> test-results/final-summary.txt
    echo "" >> test-results/final-summary.txt
    echo "Execution Time: $(date)" >> test-results/final-summary.txt
    echo "Test Type: $TEST_TYPE" >> test-results/final-summary.txt
    echo "Browser: $BROWSER" >> test-results/final-summary.txt
    echo "Headless Mode: $HEADLESS" >> test-results/final-summary.txt
    echo "" >> test-results/final-summary.txt
    
    # Count test artifacts
    if [ -d "test-results" ]; then
        local screenshot_count=$(find test-results -name "*.png" | wc -l)
        local video_count=$(find test-results -name "*.webm" | wc -l)
        local report_count=$(find test-results -name "*.html" | wc -l)
        
        echo "Test Artifacts Generated:" >> test-results/final-summary.txt
        echo "  Screenshots: $screenshot_count" >> test-results/final-summary.txt
        echo "  Videos: $video_count" >> test-results/final-summary.txt
        echo "  HTML Reports: $report_count" >> test-results/final-summary.txt
        echo "" >> test-results/final-summary.txt
    fi
    
    echo "✅ Final report generated: test-results/final-summary.txt"
    
    # Display summary
    echo ""
    echo "📊 Test Execution Complete!"
    echo ""
    echo "Next Steps:"
    echo "1. Review HTML report: test-results/enhanced-bsg-report/index.html"
    echo "2. Check screenshots for visual verification"
    echo "3. Analyze any test failures in detail"
    echo "4. Run specific test types if needed:"
    echo "   ./run-enhanced-tests.sh namefield chromium"
    echo "   ./run-enhanced-tests.sh workflow firefox" 
    echo "   ./run-enhanced-tests.sh kasda mobile"
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [TEST_TYPE] [BROWSER] [HEADLESS]"
    echo ""
    echo "TEST_TYPE options:"
    echo "  full          - Run all tests (default)"
    echo "  namefield     - Name field integration tests only"
    echo "  workflow      - Workflow automation tests only"
    echo "  it            - IT ticket tests only"
    echo "  kasda         - KASDA ticket tests only"
    echo "  comparison    - Compare old vs new user behavior"
    echo "  cross-browser - Cross-browser compatibility tests"
    echo ""
    echo "BROWSER options:"
    echo "  chromium      - Desktop Chrome (default)"
    echo "  firefox       - Desktop Firefox"
    echo "  webkit        - Desktop Safari"
    echo "  mobile        - Mobile Chrome"
    echo "  tablet        - Tablet Chrome"
    echo "  all           - All browsers"
    echo ""
    echo "HEADLESS options:"
    echo "  false         - Show browser UI (default)"
    echo "  true          - Run in headless mode"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Full test suite in Chrome"
    echo "  $0 namefield firefox                  # Name field tests in Firefox"
    echo "  $0 workflow mobile true               # Workflow tests on mobile, headless"
    echo "  $0 kasda all false                    # KASDA tests on all browsers, headed"
    echo ""
}

# Main execution
main() {
    case $1 in
        "-h"|"--help"|"help")
            show_usage
            exit 0
            ;;
    esac
    
    # Create results directory
    mkdir -p test-results
    
    # Execute test suite
    check_services
    run_api_tests
    prepare_test_data
    run_playwright_tests
    generate_final_report
}

# Run main function with all arguments
main "$@"