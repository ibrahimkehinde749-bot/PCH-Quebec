#!/usr/bin/env node
/**
 * Test script to simulate form submissions and verify Formspree integration
 * Run: node test-formspree.js
 */

const fetch = require('node-fetch');

// Configuration
const FORM_ENDPOINT = process.env.FORM_ENDPOINT;
if (!FORM_ENDPOINT) throw new Error('Set FORM_ENDPOINT before running this live integration test.');
const TEST_TIMEOUT = 10000; // 10 seconds

// Test data for apply.html form
const applyFormData = new (require('form-data'))();
applyFormData.append('claimCode', 'PCH789ABC123');
applyFormData.append('fullName', 'John Smith');
applyFormData.append('email', 'john.smith@example.com');
applyFormData.append('phone', '+1 (386) 293-3772');
applyFormData.append('address', '123 Main Street, New York, NY 10001');
applyFormData.append('grantType', 'innovation');
applyFormData.append('idNumber', 'PCH-DELIVERY-001');
applyFormData.append('additionalInfo', 'Interested in innovation support for tech startup.');
applyFormData.append('terms', 'on');
applyFormData.append('_subject', 'Test Sweepstakes Application — John Smith (PCH789ABC123)');
applyFormData.append('_replyto', 'john.smith@example.com');

// Test data for contact.html form
const contactFormData = new (require('form-data'))();
contactFormData.append('contactName', 'Jane Doe');
contactFormData.append('contactEmail', 'jane.doe@example.com');
contactFormData.append('subject', 'Question about sweepstakes eligibility');
contactFormData.append('message', 'Hi, I have a question about whether I am eligible to participate in the current sweepstakes. Can you provide more details?');
contactFormData.append('_subject', 'Website Contact Form Submission');
contactFormData.append('_replyto', 'jane.doe@example.com');

async function testFormSubmission(formName, formData, endpoint) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing ${formName} submission to Formspree`);
    console.log(`${'='.repeat(70)}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Form fields: ${Array.from(formData.entries()).map(([k]) => k).join(', ')}`);

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TEST_TIMEOUT);

        console.log('\n📤 Sending request...');
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders && formData.getHeaders(),
            signal: controller.signal
        });

        clearTimeout(timeout);

        console.log(`\n✅ Response Status: ${response.status} ${response.statusText}`);

        const responseData = await response.text();
        if (response.ok) {
            console.log(`✅ SUCCESS: Form submission accepted by Formspree`);
            if (responseData) {
                try {
                    const json = JSON.parse(responseData);
                    console.log(`Response: ${JSON.stringify(json, null, 2)}`);
                } catch (e) {
                    console.log(`Response: ${responseData.substring(0, 200)}`);
                }
            }
            return true;
        } else {
            console.error(`❌ FAILED: Server returned ${response.status}`);
            console.log(`Response: ${responseData.substring(0, 500)}`);
            return false;
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error(`❌ TIMEOUT: Request took longer than ${TEST_TIMEOUT}ms`);
        } else {
            console.error(`❌ ERROR: ${err.message}`);
        }
        return false;
    }
}

async function runTests() {
    console.log('\n🚀 FORMSPREE INTEGRATION TEST SUITE');
    console.log('Testing form submissions to Formspree endpoint');
    console.log(`Endpoint: ${FORM_ENDPOINT}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    const results = [];

    // Test apply form
    const applyResult = await testFormSubmission(
        'Apply Form (sweepstakes)',
        applyFormData,
        FORM_ENDPOINT
    );
    results.push({ name: 'Apply Form', passed: applyResult });

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test contact form
    const contactResult = await testFormSubmission(
        'Contact Form',
        contactFormData,
        FORM_ENDPOINT
    );
    results.push({ name: 'Contact Form', passed: contactResult });

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 TEST SUMMARY');
    console.log(`${'='.repeat(70)}`);
    results.forEach(({ name, passed }) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${status}: ${name}`);
    });

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    console.log(`\nTotal: ${passedCount}/${totalCount} tests passed`);

    if (passedCount === totalCount) {
        console.log('\n🎉 All tests passed! Your Formspree integration is working correctly.');
        console.log('\nNext steps:');
            console.log('1. Check your Formspree dashboard for the submitted records.');
        console.log('2. Verify submissions appear there with correct field values');
        console.log('3. If email forwarding is configured, check officialpch00112@gmail.com');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
        console.log('\n🔍 Troubleshooting:');
        console.log('1. Verify FORM_ENDPOINT is correct: ' + FORM_ENDPOINT);
        console.log('2. Check network connectivity');
        console.log('3. Verify FORM_ENDPOINT is the correct Formspree endpoint.');
        console.log('4. Check Formspree dashboard for any configuration issues');
    }

    process.exit(passedCount === totalCount ? 0 : 1);
}

// Run tests
runTests().catch(err => {
    console.error('🔥 Unexpected error:', err);
    process.exit(1);
});
