import { generateImagePromptFromSlide } from './imageGenerator';
import { getOpenAIKey, shouldUseMockData, getOpenAIModel } from './envConfig';
import { Slide, SlideType, TransitionType } from '../components/challenges/SlideMaster/SlidesMasterMain';

// Define types for the slide content structure used internally
export interface SlideContent {
  mainText?: string;
  bullets?: string[];
}

/**
 * Generate presentation content using OpenAI API
 */
export async function generatePresentationContent(
  prompt: string,
  style: string,
  audience: string
): Promise<string> {
  console.log(`Generating presentation with OpenAI: "${prompt}", style: "${style}", audience: "${audience}"`);
  
  try {
    // Get the API key - if not available, fall back to mock data
    const apiKey = getOpenAIKey();
    if (!apiKey || apiKey === 'not-a-real-key' || apiKey === '%REACT_APP_OPENAI_API_KEY%' || shouldUseMockData()) {
      console.log('Using mock data because API key is not properly configured');
      return generateMockPresentationContent(prompt, style, audience);
    }
    
    const model = getOpenAIModel();
    
    // Create a detailed system prompt to generate well-structured slides
    const systemPrompt = `You are a presentation expert that creates well-structured slide content. 
      Generate a complete presentation in the ${style} style for a ${audience} audience.
      Use triple underscores "___" to separate each slide. 
      
      For each slide:
      1. Include a clear, concise title
      2. For content slides, use bullet points (prefixed with *) for key information
      3. For slides that would benefit from visuals, include an image prompt in the format [IMAGE: detailed description]
      4. End each slide with presenter notes in the format [NOTES: helpful speaking notes]
      
      Follow this structure:
      - First slide: Title slide with a compelling title and subtitle
      - Second slide: Agenda or overview listing the main sections
      - Content slides: Include at least one slide with an image suggestion
      - Conclusion slide: Summarize key takeaways
      
      Total slides should be between 7-10 for a complete presentation.
      Make the presentation comprehensive, engaging, and visually descriptive.`;
    
    // Setup the API endpoint and configuration
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    };
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No content returned from OpenAI API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating presentation content:', error);
    // Fall back to mock data on error
    return generateMockPresentationContent(prompt, style, audience);
  }
}

/**
 * Generate mock presentation content for development/demo purposes
 */
function generateMockPresentationContent(prompt: string, style: string, audience: string): string {
  // Create a mock presentation based on the prompt
  const topic = prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt;
  
  return `# ${topic}
## Your ${style} presentation for ${audience}

___

# Introduction to ${topic}
* Understanding the basics
* Why this matters to ${audience}
* Key objectives for this presentation
[IMAGE: An engaging opening image showing the main concept of ${topic} with a ${style} aesthetic]
[NOTES: Welcome everyone and introduce the topic with enthusiasm. Establish your credibility on this subject.]

___

# Agenda
* Background and Context
* Key Concepts
* Applications and Use Cases
* Benefits and Challenges
* Next Steps and Recommendations
[IMAGE: A clean organized roadmap or journey visual showing the presentation flow]
[NOTES: Briefly walk through what we'll cover today to set expectations.]

___

# Background and Context
* Historical development of ${topic}
* Current landscape and trends
* Relevance to ${audience}
[IMAGE: Timeline or evolution diagram showing how ${topic} has developed over time]
[NOTES: Provide enough context to ensure everyone has the foundational knowledge needed.]

___

# Key Concepts
* Fundamental principles
* Important terminology
* Core frameworks to understand
[IMAGE: Visual diagram showing the relationship between the key concepts of ${topic}]
[NOTES: Explain these concepts in simple terms with real-world examples that resonate with ${audience}.]

___

# Applications and Use Cases
* Real-world examples
* Success stories
* Potential opportunities
* How ${audience} can leverage this
[IMAGE: Collage of real application examples or implementation scenarios for ${topic}]
[NOTES: Share specific examples that are most relevant to this audience. Consider asking if anyone has experience with these applications.]

___

# Benefits and Challenges
* Advantages of implementation
* Potential obstacles to consider
* Strategies for overcoming challenges
* ROI considerations for ${audience}
[IMAGE: Balance scale or comparison chart showing the benefits versus challenges]
[NOTES: Be honest about the challenges while maintaining an optimistic tone about overcoming them.]

___

# Next Steps and Recommendations
* Practical implementation advice
* Resources for further learning
* Recommended timeline
* Support options
[IMAGE: Action plan or roadmap showing the path forward with clear steps]
[NOTES: Make these recommendations specific and actionable. Offer yourself as a resource for follow-up questions.]

___

# Thank You!
* Contact information
* Q&A session
* Additional resources
[IMAGE: Professional closing image with contact details and a thank you message in ${style} style]
[NOTES: Thank the audience for their time. Encourage questions and engagement after the presentation.]`;
}

/**
 * Parse generated content into structured slide objects
 */
export function parseContentIntoSlides(content: string): Slide[] {
  // Split content by the page break marker
  const slideTexts = content.split('___').map(text => text.trim()).filter(text => text.length > 0);
  
  // Process each slide text into a structured slide object
  return slideTexts.map((slideText, index) => {
    // Generate a unique ID for the slide
    const id = `slide-${index + 1}`;
    
    // Extract the title (first line starting with # or ##)
    const titleMatch = slideText.match(/^(#|##)\s*(.+)$/m);
    const title = titleMatch ? titleMatch[2].trim() : `Slide ${index + 1}`;
    
    // Determine slide type based on content or index
    let slideType: SlideType = 'content';
    if (index === 0) {
      slideType = 'title';
    } else if (index === 1 && (title.toLowerCase().includes('agenda') || title.toLowerCase().includes('overview'))) {
      slideType = 'agenda';
    } else if (index === slideTexts.length - 1) {
      if (title.toLowerCase().includes('thank')) {
        slideType = 'thankyou';
      } else {
        slideType = 'conclusion';
      }
    }
    
    // Extract bullet points (lines starting with *)
    const bulletMatches = slideText.match(/^\*\s*(.+)$/gm);
    const bullets = bulletMatches 
      ? bulletMatches.map(bullet => bullet.replace(/^\*\s*/, '').trim()) 
      : [];
    
    // Extract image prompt if present [IMAGE: description]
    const imageMatch = slideText.match(/\[IMAGE:\s*([^\]]+)\]/);
    const imagePrompt = imageMatch ? imageMatch[1].trim() : null;
    
    // Extract presenter notes if present [NOTES: notes]
    const notesMatch = slideText.match(/\[NOTES:\s*([^\]]+)\]/);
    const notes = notesMatch ? notesMatch[1].trim() : '';
    
    // Extract main text (everything that's not a title, bullet, image prompt, or notes)
    let mainText = slideText
      .replace(/^(#|##)\s*.+$/m, '') // Remove title
      .replace(/^\*\s*.+$/gm, '')    // Remove bullets
      .replace(/\[IMAGE:\s*[^\]]+\]/, '') // Remove image prompt
      .replace(/\[NOTES:\s*[^\]]+\]/, '') // Remove notes
      .trim();
    
    // If the first slide, try to extract a subtitle
    let subtitle = '';
    if (index === 0) {
      const subtitleMatch = mainText.match(/^(.+)$/m);
      if (subtitleMatch) {
        subtitle = subtitleMatch[0].trim();
        mainText = mainText.replace(subtitleMatch[0], '').trim();
      }
    }
    
    // Create and return the slide object
    return {
      id,
      type: slideType,
      title,
      content: {
        mainText: mainText || (subtitle ? subtitle : undefined),
        bullets: bullets.length > 0 ? bullets : undefined,
      },
      notes,
      imagePrompt: imagePrompt || undefined,
      transition: 'fade' as TransitionType
    };
  });
}

export default {
  generatePresentationContent,
  parseContentIntoSlides
}; 