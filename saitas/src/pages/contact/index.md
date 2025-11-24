---
title: Open a Channel
slug: contact
description: Have a question, a story from the Path, or a tool worth testing? Open
  a channel. We read all dispatches sent to Gridors.
cache_enable: false
hide_next_prev_page_buttons: true
form:
  name: contact-form
  fields:
  - name: name
    label: Your Name or Callsign
    placeholder: Enter your name
    type: text
    validate:
      required: true
  - name: email
    label: Your Frequency (Email)
    placeholder: Enter your email address
    type: email
    validate:
      required: true
  - name: subject
    label: Subject of Transmission
    type: text
    placeholder: e.g., Question about Solar Systems
    validate:
      required: true
  - name: message
    label: Your Dispatch
    placeholder: Enter your message here...
    type: textarea
    validate:
      required: true
  buttons:
  - type: submit
    value: Send Dispatch
    classes: btn btn-primary btn-lg
  process:
  - email:
      from: '{{ form.value.email|e }}'
      to: contact@gridors.com
      subject: '[Gridors Dispatch] {{ form.value.subject|e }}'
      body: '{% include ''forms/data.html.twig'' %}'
  - save:
      fileprefix: contact-
      dateformat: Ymd-His-u
      json: true
  - message: Your dispatch has been sent. We will review it and reply if a response
      is needed. Stay resilient.
date: '2025-06-27T17:50:38.609637+00:00'
layout: ../../layouts/Layout.astro
tags: []
draft: false
author: Unknown
---
The Path is walked together, and knowledge is shared. A question asked is a lesson for all; a story told strengthens the community. Whether you have a query about a specific guide, a suggestion for a tool worth testing, or a dispatch from your own homesteading journey, we are listening.

Use this form to open a secure channel. We read every transmission and will respond within 24-48 hours if a reply is warranted.

---

<div class="form-container mt-4">
    {% if form.message %}
        <div class="alert alert-success">
            {{ form.message|raw }}
        </div>
    {% else %}
        <form name="{{ form.name }}" action="{{ page.url }}" method="post">
            {% for field in form.fields %}
                <div class="form-group">
                    <label for="form-input-{{ field.name }}">**{{ field.label }}**</label>
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <span class="input-group-text">
                                {% if field.name == 'name' %}<i class="fa fa-user"></i>{% elseif field.name == 'email' %}<i class="fa fa-at"></i>{% elseif field.name == 'subject' %}<i class="fa fa-pencil-alt"></i>{% elseif field.name == 'message' %}<i class="fa fa-file-alt"></i>{% endif %}
                            </span>
                        </div>
                        {% if field.type == 'textarea' %}
                            <textarea name="{{ field.name }}" id="form-input-{{ field.name }}" class="form-control" placeholder="{{ field.placeholder }}" rows="7" {% if field.validate.required %}required{% endif %}>{{ form.value(field.name) }}</textarea>
                        {% else %}
                            <input name="{{ field.name }}" id="form-input-{{ field.name }}" type="{{ field.type|default('text') }}" class="form-control" value="{{ form.value(field.name) }}" placeholder="{{ field.placeholder }}" {% if field.validate.required %}required{% endif %} />
                        {% endif %}
                    </div>
                </div>
            {% endfor %}
            <div class="form-buttons mt-4">
                {% for button in form.buttons %}
                    <button class="{{ button.classes|default('btn btn-primary') }}" type="{{ button.type|default('submit') }}"><i class="fa fa-paper-plane mr-2"></i> {{ button.value|default('Submit') }}</button>
                {% endfor %}
            </div>
            {{ nonce_field('form', 'form-nonce')|raw }}
        </form>
    {% endif %}
</div>